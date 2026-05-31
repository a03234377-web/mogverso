"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  advanceTorneoPhaseIfNeeded,
  ensureTorneoState,
} from "@/features/torneo/data/torneo-client";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { healTorneoApi, voteTorneoApi } from "@/lib/api/vote-client";
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
  const [{ state, loading }, dispatch] = useReducer(
    torneoHookReducer,
    initialTorneoHookState,
  );

  const applyState = useCallback(
    async (incoming: TorneoState) => {
      if (!fb) return;
      const now = Date.now();
      if (incoming.phaseEnd <= now - 2000) {
        const advanced = await advanceTorneoPhaseIfNeeded(fb, incoming, now);
        dispatch({ type: "sync", payload: advanced ?? incoming });
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
    if (state.phaseEnd > Date.now()) return;

    const id = setInterval(() => {
      if (state.phaseEnd <= Date.now()) {
        void advanceTorneoPhaseIfNeeded(fb, state).then((advanced) => {
          if (advanced) dispatch({ type: "patch", payload: advanced });
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [fb, active, state]);

  const vote = useCallback(
    async (matchId: string, playerName: string) => {
      const token = await getToken();
      const result = await voteTorneoApi(matchId, playerName, token);
      if (!result.ok) {
        return { ok: false, reason: result.reason ?? result.error ?? "vote_failed" };
      }
      return { ok: true };
    },
    [getToken],
  );

  const resetTorneo = useCallback(async () => {
    await healTorneoApi({ restartIfEnded: true });
    if (!fb) return;
    const snap = await fb.get(fb.ref(fb.db, "torneo/state"));
    if (snap.exists()) {
      dispatch({ type: "set", payload: snap.val() as TorneoState });
    }
  }, [fb]);

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

  return {
    state,
    loading,
    vote,
    resetTorneo,
    getLocalVote,
    phases: PHASES,
  };
}
