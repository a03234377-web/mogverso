"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { ProfilePage } from "@/features/rankings/pages/ProfilePage";
import { resolveRankerFromProfileSlug } from "@/features/rankings/lib/profile-slug";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";
import type { RankedEntry } from "@/features/rankings/lib/ranking";

export function ProfileRoute() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { entries } = useRankingData();

  const ranker = resolveRankerFromProfileSlug(slug);
  if (!ranker) {
    notFound();
  }

  const entry = entries.find((e: RankedEntry) => e.name === ranker.name);
  const rankPosition = entry ? entry.rank - 1 : 0;

  return <ProfilePage ranker={ranker} rankPosition={rankPosition} />;
}
