"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  buildRankedList,
  computeMovers,
  getRankedNamesFromOverrides,
} from "@/features/rankings/lib/ranking";
import type {
  MoverStack,
  RankMovements,
  RankOverrides,
  RankVoteRound,
} from "@/features/shared/lib/types";

export function useRankingData() {
  const { fb, ready } = useFirebase();
  const [overrides, setOverrides] = useState<RankOverrides>({});
  const [overridesReady, setOverridesReady] = useState(false);
  const [movements, setMovements] = useState<RankMovements>({});
  const [movementsUp, setMovementsUp] = useState<MoverStack>({});
  const [movementsDown, setMovementsDown] = useState<MoverStack>({});
  const [rankVoteEnd, setRankVoteEnd] = useState<number | null>(null);
  const healInFlightRef = useRef(false);

  const healRankVoteRound = useCallback(
    async (rv?: RankVoteRound) => {
      if (!fb || healInFlightRef.current) return;
      healInFlightRef.current = true;
      try {
        const now = Date.now();
        if (rv && !rv.resolved && rv.endTime <= now) {
          await fb.resolveRVIfNeeded(rv as Record<string, unknown>);
        } else {
          await fb.ensureRVExists();
        }
      } catch (err) {
        console.error("[LooksMax] heal rankvote round:", err);
      } finally {
        healInFlightRef.current = false;
      }
    },
    [fb],
  );

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    void fb.ensureRVExists().catch((err) => {
      console.error("[LooksMax] ensureRVExists (rankings):", err);
    });

    const unsubO = onValue(ref(db, "rankOverrides"), (snap) => {
      setOverrides(snap.exists() ? (snap.val() as RankOverrides) : {});
      setOverridesReady(true);
    });
    const unsubM = onValue(ref(db, "rankMovements"), (snap) => {
      setMovements(snap.exists() ? (snap.val() as RankMovements) : {});
    });
    const unsubUp = onValue(ref(db, "rankMovementsUp"), (snap) => {
      setMovementsUp(snap.exists() ? (snap.val() as MoverStack) : {});
    });
    const unsubDown = onValue(ref(db, "rankMovementsDown"), (snap) => {
      setMovementsDown(snap.exists() ? (snap.val() as MoverStack) : {});
    });
    const unsubRv = onValue(ref(db, "rankvote/current"), (snap) => {
      if (!snap.exists()) {
        setRankVoteEnd(null);
        void healRankVoteRound();
        return;
      }

      const rv = snap.val() as RankVoteRound;
      const now = Date.now();

      if (!rv.resolved && rv.endTime > now) {
        setRankVoteEnd(rv.endTime);
        return;
      }

      setRankVoteEnd(null);
      void healRankVoteRound(rv);
    });

    const healPoll = setInterval(() => {
      void healRankVoteRound();
    }, 4000);

    return () => {
      unsubO();
      unsubM();
      unsubUp();
      unsubDown();
      unsubRv();
      clearInterval(healPoll);
    };
  }, [fb, healRankVoteRound]);

  const rankedNames = useMemo(
    () =>
      fb
        ? fb.getRankedNamesFromOverrides(overrides)
        : getRankedNamesFromOverrides(overrides),
    [fb, overrides],
  );

  const entries = useMemo(
    () =>
      buildRankedList(overrides, movements, undefined, {
        up: movementsUp,
        down: movementsDown,
      }),
    [overrides, movements, movementsUp, movementsDown],
  );

  const { upMovers, downMovers } = useMemo(
    () =>
      computeMovers(rankedNames, movements, {
        up: movementsUp,
        down: movementsDown,
      }),
    [rankedNames, movements, movementsUp, movementsDown],
  );

  const rankingReady = ready && (!fb || overridesReady);

  return {
    ready: rankingReady,
    entries: rankingReady ? entries : [],
    upMovers: rankingReady ? upMovers : [],
    downMovers: rankingReady ? downMovers : [],
    rankVoteEnd,
    overrides,
  };
}
