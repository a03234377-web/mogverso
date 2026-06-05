"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { formatVoteError } from "@/lib/api/vote-errors";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  advanceTorneoPhaseIfNeeded,
  ensureTorneoState,
} from "@/features/torneo/data/torneo-client";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { patchTorneoVoteCount } from "@/features/torneo/lib/patch-torneo-vote";
import {
  fetchTorneoMyVotesApi,
  healTorneoApi,
  voteTorneoApi,
} from "@/lib/api/vote-client";
import {
  torneoLocalVoteStorageKey,
  torneoLocalVoteStorageKeyLegacy,
} from "@/lib/torneo-vote-keys";
import {
  getEditionStartMsForWeekContaining,
  getTorneoVotingTargetMs,
  getTorneoWaitingTargetMs,
  isTorneoLegacyBreakReadyToOpen,
  isTorneoPhaseExpired,
} from "@/lib/torneo-schedule";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { HEAL_TORNEO_COOLDOWN_MS, TORNEO_HEAL_POLL_MS } from "@/lib/vote-intervals";
import type { TorneoState } from "@/types/looksmax";

type TorneoHookState = {
  state: TorneoState | null;
  loading: boolean;
};

const initialTorneoHookState: TorneoHookState = {
  state: null,
  loading: true,
};

type TorneoHookAction =
  | { type: "set"; payload: TorneoState | null }
  | { type: "sync"; payload: TorneoState }
  | { type: "patch"; payload: TorneoState };

function torneoHookReducer(
  state: TorneoHookState,
  action: TorneoHookAction,
): TorneoHookState {
  switch (action.type) {
    case "set":
      return { state: action.payload, loading: false };
    case "sync":
      return { state: action.payload, loading: false };
    case "patch":
      return { ...state, state: action.payload };
    default:
      return state;
  }
}

export function useTorneo(active: boolean) {
  const { fb } = useFirebase();
  const { getToken } = useRecaptcha("torneo_vote");
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [serverVotesCache, setServerVotesCache] = useState<{
    editionStartMs: number;
    votes: Record<string, string>;
  } | null>(null);
  const [{ state, loading }, dispatch] = useReducer(
    torneoHookReducer,
    initialTorneoHookState,
  );
  const lastSyncHealRef = useRef(0);
  const editionStartMs = state?.editionStartMs;
  const serverVotes =
    editionStartMs && serverVotesCache?.editionStartMs === editionStartMs
      ? serverVotesCache.votes
      : {};

  const applyState = useCallback(
    async (incoming: TorneoState) => {
      if (!fb) return;
      const now = Date.now();
      const editionStart = getEditionStartMsForWeekContaining(now);
      const waitingPastStart =
        incoming.phase === PHASES.WAITING_OCTAVOS && now >= editionStart;
      const waitingStaleTarget =
        incoming.phase === PHASES.WAITING_OCTAVOS &&
        Math.abs(incoming.phaseEnd - getTorneoWaitingTargetMs(incoming, now)) > 60_000;
      const votingStaleTarget =
        incoming.phase !== PHASES.WAITING_OCTAVOS &&
        incoming.phase !== PHASES.TORNEO_ENDED &&
        Math.abs(incoming.phaseEnd - getTorneoVotingTargetMs(incoming, now)) > 60_000;
      const legacyBreakNeedsOpen =
        (incoming.phase === PHASES.BREAK_CUARTOS ||
          incoming.phase === PHASES.SEMIFINALS_PROMO) &&
        isTorneoLegacyBreakReadyToOpen(incoming, now);

      const needsSyncHeal =
        waitingPastStart ||
        waitingStaleTarget ||
        votingStaleTarget ||
        legacyBreakNeedsOpen;

      if (needsSyncHeal || isTorneoPhaseExpired(incoming, now)) {
        if (needsSyncHeal) {
          if (now - lastSyncHealRef.current >= HEAL_TORNEO_COOLDOWN_MS) {
            lastSyncHealRef.current = now;
            await healTorneoApi();
          }
        } else {
          await advanceTorneoPhaseIfNeeded(fb, incoming, now);
        }
        const advanced = await fb.get(fb.ref(fb.db, "torneo/state"));
        dispatch({
          type: "sync",
          payload: advanced.exists() ? (advanced.val() as TorneoState) : incoming,
        });
      } else {
        dispatch({ type: "sync", payload: incoming });
      }
    },
    [fb],
  );

  useEffect(() => {
    if (!fb || !active) return;

    void ensureTorneoState(fb).then((initial) => {
      dispatch({ type: "set", payload: initial });
    });

    const { db, ref, onValue } = fb;
    let debounceId: ReturnType<typeof setTimeout> | null = null;

    const unsub = onValue(ref(db, "torneo/state"), (snap) => {
      if (!snap.exists()) return;
      const incoming = snap.val() as TorneoState;
      if (
        incoming.phase === PHASES.OCTAVOS_VOTING ||
        incoming.phase === PHASES.CUARTOS_VOTING ||
        incoming.phase === PHASES.SEMIFINALS_VOTING ||
        incoming.phase === PHASES.FINAL_VOTING
      ) {
        setVoteError(null);
      }
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        void applyState(incoming);
      }, 400);
    });

    return () => {
      unsub();
      if (debounceId) clearTimeout(debounceId);
    };
  }, [fb, active, applyState]);

  useEffect(() => {
    if (!active || !editionStartMs) return;

    let cancelled = false;
    void fetchTorneoMyVotesApi(editionStartMs)
      .then((votes) => {
        if (!cancelled) setServerVotesCache({ editionStartMs, votes });
      })
      .catch(() => {
        /* best-effort: localStorage cubre el voto del usuario */
      });

    return () => {
      cancelled = true;
    };
  }, [active, editionStartMs]);

  useEffect(() => {
    if (!fb || !active || !state) return;

    const tick = async () => {
      const now = Date.now();
      const editionStart = getEditionStartMsForWeekContaining(now);
      const waitingPastStart =
        state.phase === PHASES.WAITING_OCTAVOS && now >= editionStart;
      const phaseExpired = isTorneoPhaseExpired(state, now);

      if (!waitingPastStart && !phaseExpired) return;

      if (waitingPastStart) {
        await healTorneoApi();
      } else {
        const advanced = await advanceTorneoPhaseIfNeeded(fb, state, now);
        if (advanced) {
          dispatch({ type: "patch", payload: advanced });
          return;
        }
      }

      const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
      if (snap.exists()) {
        dispatch({ type: "patch", payload: snap.val() as TorneoState });
      }
    };

    const now = Date.now();
    const editionStart = getEditionStartMsForWeekContaining(now);
    const waitingPastStart =
      state.phase === PHASES.WAITING_OCTAVOS && now >= editionStart;
    const phaseExpired = isTorneoPhaseExpired(state, now);

    if (!waitingPastStart && !phaseExpired) return;

    void tick();
    const id = setInterval(() => void tick(), TORNEO_HEAL_POLL_MS);
    return () => clearInterval(id);
  }, [fb, active, state?.phase, state?.phaseEnd, state?.createdAt]);

  const getTorneoVoteKey = useCallback(
    (matchId: string) => {
      const editionStartMs =
        state?.editionStartMs ?? getEditionStartMsForWeekContaining(Date.now());
      return torneoLocalVoteStorageKey(editionStartMs, matchId);
    },
    [state?.editionStartMs],
  );

  const getLocalVote = useCallback(
    (matchId: string) => {
      if (typeof window === "undefined") return serverVotes[matchId] ?? null;

      try {
        const fromStorage = localStorage.getItem(getTorneoVoteKey(matchId));
        if (fromStorage) return fromStorage;

        const legacyKey = torneoLocalVoteStorageKeyLegacy(
          state?.createdAt ?? 0,
          matchId,
        );
        const legacy = state?.createdAt ? localStorage.getItem(legacyKey) : null;
        if (legacy) return legacy;
      } catch {
        /* quota / private mode */
      }

      return serverVotes[matchId] ?? null;
    },
    [getTorneoVoteKey, serverVotes, state],
  );

  const vote = useCallback(
    async (matchId: string, playerName: string) => {
      setVoteError(null);
      setVoting(true);
      try {
        const token = await getToken();
        let result = await voteTorneoApi(matchId, playerName, token);
        if (
          !result.ok &&
          (result.reason === "wrong_phase" || result.reason === "match_not_found")
        ) {
          await healTorneoApi();
          const retryToken = await getToken();
          result = await voteTorneoApi(matchId, playerName, retryToken);
        }
        if (!result.ok) {
          const reason = result.reason ?? result.error ?? "vote_failed";
          setVoteError(formatVoteError(reason));
          return { ok: false, reason };
        }
        try {
          localStorage.setItem(getTorneoVoteKey(matchId), playerName);
        } catch {
          /* quota / private mode */
        }
        setServerVotesCache((prev) => {
          const edition = state?.editionStartMs ?? prev?.editionStartMs;
          if (!edition) return prev;
          const votes = prev?.editionStartMs === edition ? prev.votes : {};
          return {
            editionStartMs: edition,
            votes: { ...votes, [matchId]: playerName },
          };
        });

        if (state) {
          dispatch({
            type: "patch",
            payload: patchTorneoVoteCount(state, matchId, playerName),
          });
        }

        if (fb) {
          const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
          if (snap.exists()) {
            dispatch({ type: "patch", payload: snap.val() as TorneoState });
          }
        }
        return { ok: true };
      } finally {
        setVoting(false);
      }
    },
    [fb, getToken, getTorneoVoteKey, state],
  );

  const resetTorneo = useCallback(async () => {
    await healTorneoApi({ restartIfEnded: true });
    if (!fb) return;
    const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
    if (snap.exists()) {
      dispatch({ type: "set", payload: snap.val() as TorneoState });
    }
  }, [fb]);

  return {
    state,
    loading,
    voting,
    voteError,
    vote,
    resetTorneo,
    getLocalVote,
    phases: PHASES,
  };
}
