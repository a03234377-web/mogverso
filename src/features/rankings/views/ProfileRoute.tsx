"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { ProfilePage } from "@/features/rankings/pages/ProfilePage";
import { RANKERS } from "@/features/rankings/data/rankers";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import type { RankedEntry } from "@/features/rankings/lib/ranking";

export function ProfileRoute() {
  const params = useParams();
  const index = Number(params.index);
  const { entries } = useRankingData();

  if (!Number.isInteger(index) || index < 0 || index >= RANKERS.length) {
    notFound();
  }

  const entry = entries.find((e: RankedEntry) => e.originalIndex === index);
  const rankPosition = entry ? entry.rank - 1 : 0;

  return <ProfilePage profileIndex={index} rankPosition={rankPosition} />;
}
