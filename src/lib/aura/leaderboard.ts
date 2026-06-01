import { AURA_LEADERS_COUNT, AURA_RANKING_SIZE } from "@/lib/aura/constants";

export type AuraLeader = {
  name: string;
  rank: number;
  aura: number;
};

export function auraForName(scores: Record<string, number>, name: string): number {
  const v = scores[name];
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** Top N del ranking oficial por puntuación de aura. */
export function computeAuraLeaders(
  rankedNames: string[],
  scores: Record<string, number>,
  count = AURA_LEADERS_COUNT,
): { top: AuraLeader[]; bottom: AuraLeader[] } {
  const eligible = rankedNames.slice(0, AURA_RANKING_SIZE);
  const rows: AuraLeader[] = eligible.map((name, i) => ({
    name,
    rank: i + 1,
    aura: auraForName(scores, name),
  }));

  const top = [...rows]
    .sort((a, b) => b.aura - a.aura || a.rank - b.rank)
    .slice(0, count);
  const bottom = [...rows]
    .sort((a, b) => a.aura - b.aura || a.rank - b.rank)
    .slice(0, count);

  return { top, bottom };
}
