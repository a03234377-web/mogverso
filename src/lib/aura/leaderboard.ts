import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import type { RankedEntry } from "@/features/rankings/lib/ranking";
import { AURA_LEADERS_COUNT, AURA_RANKING_SIZE } from "@/lib/aura/constants";
import { coerceAuraScore } from "@/lib/aura/coerce-score";

export type AuraLeader = {
  name: string;
  rank: number;
  aura: number;
};

export function auraForName(scores: Record<string, number>, name: string): number {
  const canonical = resolveCanonicalRankerName(name);
  if (Object.prototype.hasOwnProperty.call(scores, canonical)) {
    return coerceAuraScore(scores[canonical]);
  }
  return coerceAuraScore(scores[name]);
}

export type AuraStanding = {
  aura: number;
  /** Posición por puntuación entre el top AURA_RANKING_SIZE (1 = más aura). */
  auraRank: number | null;
  eligible: boolean;
};

/** Puntuación y posición en el ranking de aura para un participante. */
export function computeAuraStanding(
  rankedNames: string[],
  scores: Record<string, number>,
  name: string,
): AuraStanding {
  const eligible = rankedNames.slice(0, AURA_RANKING_SIZE);
  const rows = eligible.map((n, i) => ({
    name: n,
    officialRank: i + 1,
    aura: auraForName(scores, n),
  }));

  const row = rows.find((r) => r.name === name);
  if (!row) {
    return { aura: auraForName(scores, name), auraRank: null, eligible: false };
  }

  const sorted = rows.toSorted(
    (a, b) => b.aura - a.aura || a.officialRank - b.officialRank,
  );
  const auraRank = sorted.findIndex((r) => r.name === name) + 1;

  return { aura: row.aura, auraRank, eligible: true };
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

  const top = rows
    .toSorted((a, b) => b.aura - a.aura || a.rank - b.rank)
    .slice(0, count)
    .map((row, i) => ({ ...row, rank: i + 1 }));
  const bottom = rows
    .toSorted((a, b) => a.aura - b.aura || a.rank - b.rank)
    .slice(0, count)
    .map((row, i) => ({ ...row, rank: i + 1 }));

  return { top, bottom };
}

/** Top oficial ordenado por puntuación de aura (1 = más aura; empate → rank oficial). */
export function sortEntriesByAura(
  entries: RankedEntry[],
  scores: Record<string, number>,
): RankedEntry[] {
  const sorted = entries.toSorted((a, b) => {
    const diff = auraForName(scores, b.name) - auraForName(scores, a.name);
    if (diff !== 0) return diff;
    return a.rank - b.rank;
  });
  return sorted.map((entry, i) => ({ ...entry, rank: i + 1 }));
}
