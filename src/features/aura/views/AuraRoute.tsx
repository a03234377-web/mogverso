"use client";

import { AuraPage } from "@/features/aura/pages/AuraPage";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";

export function AuraRoute() {
  const { entries, ready, auraScores, patchAuraScore } = useRankingData();

  return (
    <AuraPage
      entries={entries}
      rankingReady={ready}
      scores={auraScores}
      onPatchScore={patchAuraScore}
    />
  );
}
