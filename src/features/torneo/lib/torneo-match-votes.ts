import type { TorneoMatch } from "@/types/looksmax";

export type TorneoMatchVoteStats = {
  v1: number;
  v2: number;
  total: number;
  pct1: number;
  pct2: number;
  leader: string | null;
  isTie: boolean;
};

export function getTorneoPlayerVotes(match: TorneoMatch, player: string): number {
  return match.votes?.[player] ?? 0;
}

export function getTorneoMatchVoteStats(match: TorneoMatch): TorneoMatchVoteStats {
  const v1 = getTorneoPlayerVotes(match, match.p1);
  const v2 = getTorneoPlayerVotes(match, match.p2);
  const total = v1 + v2;
  const pct1 = total > 0 ? Math.round((v1 / total) * 100) : 50;
  const pct2 = total > 0 ? 100 - pct1 : 50;

  let leader: string | null = null;
  if (v1 > v2) leader = match.p1;
  else if (v2 > v1) leader = match.p2;

  return {
    v1,
    v2,
    total,
    pct1,
    pct2,
    leader,
    isTie: total > 0 && v1 === v2,
  };
}
