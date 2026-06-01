"use client";

import { useCallback, useEffect, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { parseAuraScores } from "@/lib/aura/coerce-score";
import type { AuraScores } from "@/types/aura";

export function useAuraScores() {
  const { fb, ready } = useFirebase();
  const [scores, setScores] = useState<AuraScores>({});

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsub = onValue(ref(db, "aura/scores"), (snap) => {
      setScores(snap.exists() ? parseAuraScores(snap.val()) : {});
    });

    return () => unsub();
  }, [fb]);

  const patchScore = useCallback((name: string, aura: number) => {
    const canonical = resolveCanonicalRankerName(name);
    setScores((prev) => ({ ...prev, [canonical]: aura }));
  }, []);

  return {
    ready,
    scores,
    patchScore,
  };
}
