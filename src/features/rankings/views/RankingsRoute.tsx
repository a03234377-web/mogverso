"use client";

import { RankingsPage } from "@/features/rankings/pages/RankingsPage";
import { useRankingData } from "@/features/rankings/hooks/useRankingData";

export function RankingsRoute() {
  const { entries, upMovers, downMovers, rankVoteEnd } = useRankingData();
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <RankingsPage
      entries={entries}
      upMovers={upMovers}
      downMovers={downMovers}
      rankVoteEnd={rankVoteEnd}
      adsenseClient={adsenseClient}
    />
  );
}
