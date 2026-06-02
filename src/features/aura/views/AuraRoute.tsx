"use client";

import { useCallback } from "react";
import { AuraPage } from "@/features/aura/pages/AuraPage";
import { useAuraScores } from "@/features/aura/hooks/useAuraScores";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";

export function AuraRoute() {
  const { entries, ready, patchAuraScore: patchRankingAura } = useRankingData();
  const { scores, ready: scoresReady, patchScore } = useAuraScores();

  const patchAuraScore = useCallback(
    (name: string, aura: number) => {
      patchScore(name, aura);
      patchRankingAura(name, aura);
    },
    [patchScore, patchRankingAura],
  );

  return (
    <AuraPage
      entries={entries}
      rankingReady={ready}
      scoresReady={scoresReady}
      scores={scores}
      onPatchScore={patchAuraScore}
    />
  );
}
