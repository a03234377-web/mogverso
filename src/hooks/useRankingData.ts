"use client";

import { useEffect, useMemo, useState } from "react";
import { useFirebase } from "@/contexts/FirebaseProvider";
import {
  buildRankedList,
  computeMovers,
  getRankedNamesFromOverrides,
} from "@/lib/looksmax/ranking";
import type {
  RankMovements,
  RankOverrides,
  RankVoteRound,
} from "@/lib/looksmax/types";

export function useRankingData() {
  const { fb, ready } = useFirebase();
  const [overrides, setOverrides] = useState<RankOverrides>({});
  const [movements, setMovements] = useState<RankMovements>({});
  const [rankVoteEnd, setRankVoteEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsubO = onValue(ref(db, "rankOverrides"), (snap) => {
      setOverrides(snap.exists() ? (snap.val() as RankOverrides) : {});
    });
    const unsubM = onValue(ref(db, "rankMovements"), (snap) => {
      setMovements(snap.exists() ? (snap.val() as RankMovements) : {});
    });
    const unsubRv = onValue(ref(db, "rankvote/current"), async (snap) => {
      if (snap.exists()) {
        const rv = snap.val() as RankVoteRound;
        if (!rv.resolved && rv.endTime > Date.now()) {
          setRankVoteEnd(rv.endTime);
          return;
        }
      } else {
        await fb.ensureRVExists();
      }
      setRankVoteEnd(null);
    });

    return () => {
      unsubO();
      unsubM();
      unsubRv();
    };
  }, [fb]);

  const rankedNames = useMemo(
    () => (fb ? fb.getRankedNamesFromOverrides(overrides) : getRankedNamesFromOverrides(overrides)),
    [fb, overrides],
  );

  const entries = useMemo(
    () => buildRankedList(overrides, movements),
    [overrides, movements],
  );

  const { upMovers, downMovers } = useMemo(
    () => computeMovers(rankedNames, movements),
    [rankedNames, movements],
  );

  return { ready, entries, upMovers, downMovers, rankVoteEnd, overrides };
}
