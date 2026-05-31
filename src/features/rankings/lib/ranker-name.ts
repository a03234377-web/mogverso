import { RANKERS } from "@/features/rankings/data/rankers";

const KNOWN_RANKER_NAMES = new Set(RANKERS.map((r) => r.name));

/** Nombre de ranker permitido (lista cerrada del roster). */
export function isKnownRankerName(name: string): boolean {
  return KNOWN_RANKER_NAMES.has(name);
}

export type RankVotePair = {
  p1?: unknown;
  p2?: unknown;
};

/** Ronda rankvote con dos candidatos válidos y distintos. */
export function isValidRankVotePair(round: RankVotePair): boolean {
  const { p1, p2 } = round;
  return (
    typeof p1 === "string" &&
    typeof p2 === "string" &&
    p1 !== p2 &&
    isKnownRankerName(p1) &&
    isKnownRankerName(p2)
  );
}

/** Texto seguro para UI cuando el valor de Firebase no es un ranker conocido. */
export function safeRankerLabel(name: string, fallback = "Candidato inválido"): string {
  return isKnownRankerName(name) ? name : fallback;
}
