import type { TorneoMatch } from "@/types/looksmax";

export const OCTAVOS_IDS = [
  "oct_0",
  "oct_1",
  "oct_2",
  "oct_3",
  "oct_4",
  "oct_5",
  "oct_6",
  "oct_7",
] as const;

export const CUARTOS_IDS = ["cua_0", "cua_1", "cua_2", "cua_3"] as const;
export const SEMIS_IDS = ["semi_0", "semi_1"] as const;

export function buildOctavosMatchesFromSeed(
  seedNames: string[],
): Record<string, TorneoMatch> {
  const matches: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 8; i++) {
    const id = `oct_${i}`;
    const p1 = seedNames[i * 2] ?? "TBD";
    const p2 = seedNames[i * 2 + 1] ?? "TBD";
    matches[id] = {
      id,
      round: "octavos",
      p1,
      p2,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return matches;
}

export function previewOctavosPairings(seedNames: string[]) {
  const matches = buildOctavosMatchesFromSeed(seedNames);
  return Object.values(matches).map((m) => ({
    id: m.id,
    p1: m.p1,
    p2: m.p2,
  }));
}

export function buildCuartosFromOctavosWinners(
  winners: (string | null)[],
): Record<string, TorneoMatch> {
  const cuartos: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 4; i++) {
    const id = `cua_${i}`;
    const p1 = winners[i * 2] || "TBD";
    const p2 = winners[i * 2 + 1] || "TBD";
    cuartos[id] = {
      id,
      round: "cuartos",
      p1,
      p2,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return cuartos;
}

export function buildSemisMatches(
  winners: (string | null)[],
): Record<string, TorneoMatch> {
  const semis: Record<string, TorneoMatch> = {};
  for (let i = 0; i < 2; i++) {
    const id = `semi_${i}`;
    const p1name = winners[i * 2] || "TBD";
    const p2name = winners[i * 2 + 1] || "TBD";
    semis[id] = {
      id,
      round: "semis",
      p1: p1name,
      p2: p2name,
      votes: { _placeholder_: 0 },
      winner: null,
      resolved: false,
    };
  }
  return semis;
}

export function buildFinalMatch(winners: (string | null)[]): TorneoMatch {
  const p1name = winners[0] || "TBD";
  const p2name = winners[1] || "TBD";
  return {
    id: "final_0",
    round: "final",
    p1: p1name,
    p2: p2name,
    votes: { _placeholder_: 0 },
    winner: null,
    resolved: false,
  };
}

export function resolveMatchPair(m: TorneoMatch): {
  winner: string;
  updated: TorneoMatch;
} {
  const v1 = m.votes?.[m.p1] || 0;
  const v2 = m.votes?.[m.p2] || 0;
  const winner = v1 >= v2 ? m.p1 : m.p2;
  return {
    winner,
    updated: { ...m, winner, resolved: true },
  };
}

export function resolveRoundMatches(
  ids: readonly string[],
  obj: Record<string, TorneoMatch>,
): { winners: (string | null)[]; updatedMatches: Record<string, TorneoMatch> } {
  const updatedMatches = structuredClone(obj);
  const winners: (string | null)[] = [];
  ids.forEach((id) => {
    const m = updatedMatches[id];
    if (!m) {
      winners.push(null);
      return;
    }
    const { winner, updated } = resolveMatchPair(m);
    updatedMatches[id] = updated;
    winners.push(winner);
  });
  return { winners, updatedMatches };
}
