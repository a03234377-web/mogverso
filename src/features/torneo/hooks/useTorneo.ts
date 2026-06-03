"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { formatVoteError } from "@/lib/api/vote-errors";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  advanceTorneoPhaseIfNeeded,
  ensureTorneoState,
} from "@/features/torneo/data/torneo-client";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { healTorneoApi, voteTorneoApi } from "@/lib/api/vote-client";
import {
  getEditionStartMsForWeekContaining,
  getTorneoWaitingTargetMs,
} from "@/lib/torneo-schedule";
import { useRecaptcha } from "@/hooks/useRecaptcha";
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
  const [{ state, loading }, dispatch] = useReducer(
    torneoHookReducer,
    initialTorneoHookState,
  );

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

      if (waitingPastStart || waitingStaleTarget || incoming.phaseEnd <= now - 2000) {
        if (waitingPastStart || waitingStaleTarget) {
          await healTorneoApi();
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
      if (incoming.phase === PHASES.OCTAVOS_VOTING) {
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
    if (!fb || !active || !state) return;

    const tick = async () => {
      const now = Date.now();
      const editionStart = getEditionStartMsForWeekContaining(now);
      const waitingPastStart =
        state.phase === PHASES.WAITING_OCTAVOS && now >= editionStart;

      if (!waitingPastStart && state.phaseEnd > now - 2000) return;

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

    void tick();
    const id = setInterval(
      () => void tick(),
      state.phase === PHASES.WAITING_OCTAVOS ? 5000 : 1000,
    );
    return () => clearInterval(id);
  }, [fb, active, state?.phase, state?.phaseEnd, state?.createdAt]);

  const getTorneoVoteKey = useCallback(
    (matchId: string) => {
      const createdAt = state?.createdAt ?? 0;
      return `torneoVote_${createdAt}_${matchId}`;
    },
    [state?.createdAt],
  );

  const getLocalVote = useCallback(
    (matchId: string) => {
      if (typeof window === "undefined") return null;
      try {
        return localStorage.getItem(getTorneoVoteKey(matchId));
      } catch {
        return null;
      }
    },
    [getTorneoVoteKey],
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
    [fb, getToken, getTorneoVoteKey],
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
