"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  advanceTorneoPhaseIfNeeded,
  ensureTorneoState,
  getInitialTorneoState,
  PHASES,
} from "@/features/torneo/data/torneo-players";
import type { TorneoState } from "@/features/shared/lib/types";

export function useTorneo(active: boolean) {
  const { fb } = useFirebase();
  const [state, setState] = useState<TorneoState | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyState = useCallback(
    async (incoming: TorneoState) => {
      if (!fb) return;
      const now = Date.now();
      if (incoming.phaseEnd <= now - 2000) {
        const advanced = await advanceTorneoPhaseIfNeeded(fb, incoming, now);
        setState(advanced ?? incoming);
      } else {
        setState(incoming);
      }
      setLoading(false);
    },
    [fb],
  );

  useEffect(() => {
    if (!fb || !active) return;

    void ensureTorneoState(fb).then((initial) => {
      setState(initial);
      setLoading(false);
    });

    const { db, ref, onValue } = fb;
    const unsub = onValue(ref(db, "torneo/state"), (snap) => {
      if (!snap.exists()) return;
      const incoming = snap.val() as TorneoState;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void applyState(incoming);
      }, 400);
    });

    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fb, active, applyState]);

  useEffect(() => {
    if (!fb || !active || !state) return;
    if (state.phaseEnd > Date.now()) return;

    const id = setInterval(() => {
      if (state.phaseEnd <= Date.now()) {
        void advanceTorneoPhaseIfNeeded(fb, state).then((advanced) => {
          if (advanced) setState(advanced);
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [fb, active, state]);

  const vote = useCallback(
    async (matchId: string, playerName: string) => {
      if (!fb) return { ok: false, reason: "no_fb" };
      return fb.castTorneoVote(matchId, playerName);
    },
    [fb],
  );

  const resetTorneo = useCallback(async () => {
    if (!fb) return;
    const fresh = getInitialTorneoState(Date.now());
    await fb.initTorneoState(fresh as Record<string, unknown>);
    setState(fresh);
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
