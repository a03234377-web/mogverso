"use client";

import { useEffect, useState } from "react";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { healAuraApi } from "@/lib/api/vote-client";
import type { AuraScores } from "@/types/aura";

export function useAuraScores() {
  const { fb, ready } = useFirebase();
  const [scores, setScores] = useState<AuraScores>({});

  useEffect(() => {
    void healAuraApi().catch((err) => {
      console.error("[Aura] heal periods:", err);
    });
  }, []);

  useEffect(() => {
    if (!fb) return;
    const { db, ref, onValue } = fb;

    const unsub = onValue(ref(db, "aura/scores"), (snap) => {
      setScores(snap.exists() ? (snap.val() as AuraScores) : {});
    });

    return () => unsub();
  }, [fb]);

  return { ready, scores };
}
