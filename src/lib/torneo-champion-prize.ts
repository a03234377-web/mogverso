import { getTorneoPlayerVotes } from "@/features/torneo/lib/torneo-match-votes";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";

export const TORNEO_CHAMPION_PRIZE_DURATION_MS = 2 * 24 * 60 * 60 * 1000;
export const TORNEO_CHAMPION_RANK_BOOST = 5;

export type TorneoChampionResult = {
  champion: string;
  championVotes: number;
  runnerUp: string;
  runnerUpVotes: number;
};

export function resolveTorneoChampionFromFinal(
  finalMatch: TorneoMatch | null | undefined,
  declaredChampion?: string | null,
): TorneoChampionResult | null {
  if (!finalMatch?.p1 || !finalMatch?.p2) return null;
  const v1 = getTorneoPlayerVotes(finalMatch, finalMatch.p1);
  const v2 = getTorneoPlayerVotes(finalMatch, finalMatch.p2);
  const champion = declaredChampion ?? (v1 >= v2 ? finalMatch.p1 : finalMatch.p2);
  const runnerUp = champion === finalMatch.p1 ? finalMatch.p2 : finalMatch.p1;
  return {
    champion,
    championVotes: getTorneoPlayerVotes(finalMatch, champion),
    runnerUp,
    runnerUpVotes: getTorneoPlayerVotes(finalMatch, runnerUp),
  };
}

export function getTorneoChampionResult(
  state: Pick<TorneoState, "champion" | "finalMatch"> | null | undefined,
): TorneoChampionResult | null {
  if (!state) return null;
  return resolveTorneoChampionFromFinal(state.finalMatch, state.champion);
}

export function getTorneoPrizeCountdownTargetMs(
  state: Pick<TorneoState, "prizeEndMs" | "phaseEnd" | "prizeApplied">,
): number {
  if (state.prizeApplied) return state.phaseEnd;
  return state.prizeEndMs ?? state.phaseEnd;
}

export function isTorneoPrizePeriodActive(
  state: Pick<TorneoState, "prizeApplied" | "prizeEndMs" | "phaseEnd">,
  now = Date.now(),
): boolean {
  if (state.prizeApplied) return false;
  return now < getTorneoPrizeCountdownTargetMs(state);
}

/** Mueve al campeón `boost` puestos arriba en el ranking ordenado. */
export function computeRankedAfterChampionBoost(
  ranked: string[],
  champion: string,
  boost = TORNEO_CHAMPION_RANK_BOOST,
): { newRanked: string[]; delta: number } {
  const idx = ranked.indexOf(champion);
  if (idx === -1) return { newRanked: ranked, delta: 0 };
  const newIdx = Math.max(0, idx - boost);
  const newRanked = [...ranked];
  newRanked.splice(idx, 1);
  newRanked.splice(newIdx, 0, champion);
  return { newRanked, delta: idx - newIdx };
}
