"use client";

import { useEffect } from "react";
import { AuraPage } from "@/features/aura/pages/AuraPage";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import { healAuraApi } from "@/lib/api/vote-client";

export function AuraRoute() {
  const { entries, ready, auraScores } = useRankingData();

  useEffect(() => {
    void healAuraApi().catch((err) => {
      console.error("[Aura] heal periods:", err);
    });
  }, []);

  return <AuraPage entries={entries} rankingReady={ready} initialScores={auraScores} />;
}
