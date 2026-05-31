"use client";

import { Suspense } from "react";
import { ProfilePage } from "@/features/rankings/pages/ProfilePage";
import type { Ranker } from "@/features/rankings/data/rankers";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import type { RankedEntry } from "@/features/rankings/lib/ranking";

type ProfileRouteProps = {
  ranker: Ranker;
};

export function ProfileRoute({ ranker }: ProfileRouteProps) {
  const { entries } = useRankingData();

  const entry = entries.find((e: RankedEntry) => e.name === ranker.name);
  const rankPosition = entry ? entry.rank - 1 : 0;

  return (
    <Suspense fallback={null}>
      <ProfilePage ranker={ranker} rankPosition={rankPosition} />
    </Suspense>
  );
}
