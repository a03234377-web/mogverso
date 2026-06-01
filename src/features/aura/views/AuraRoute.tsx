"use client";

import { AuraPage } from "@/features/aura/pages/AuraPage";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";

export function AuraRoute() {
  const { entries, ready } = useRankingData();

  return <AuraPage entries={entries} rankingReady={ready} />;
}
