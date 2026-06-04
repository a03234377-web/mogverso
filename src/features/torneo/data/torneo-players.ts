import { creatorImage } from "@/assets/creators";
import { getRankerFallback, getRankerPhoto } from "@/features/rankings/data/avatars";
import { buildOctavosMatchesFromSeed } from "@/lib/torneo-bracket";
import {
  getTorneoVotingCanonicalEndMs,
  getUpcomingTorneoStartMs,
  TORNEO_PHASE_DURATION_MS,
} from "@/lib/torneo-schedule";
import type { TorneoPhase, TorneoPlayer, TorneoState } from "@/types/looksmax";

export const PHASES = {
  WAITING_OCTAVOS: "waiting_octavos",
  OCTAVOS_VOTING: "octavos_voting",
  BREAK_CUARTOS: "break_cuartos",
  CUARTOS_VOTING: "cuartos_voting",
  SEMIFINALS_PROMO: "semifinals_promo",
  SEMIFINALS_VOTING: "semifinals_voting",
  BREAK_FINAL: "break_final",
  FINAL_VOTING: "final_voting",
  TORNEO_ENDED: "torneo_ended",
} as const satisfies Record<string, TorneoPhase>;

export { TORNEO_PHASE_DURATION_MS };

export function getPlayerByName(name: string): TorneoPlayer {
  const photo = getRankerPhoto(name);
  return {
    name,
    photo: photo ?? creatorImage("kappah.webp"),
    icon: getRankerFallback(name),
  };
}

/** Octavos con top 16 congelado (1v2, 3v4, …). */
export function buildOctavosTorneoState(
  now: number,
  seedNames: string[],
  editionStartMs?: number,
): TorneoState {
  const edition = editionStartMs ?? getUpcomingTorneoStartMs(now);
  const draft = {
    phase: PHASES.OCTAVOS_VOTING,
    phaseStart: now,
    phaseEnd: now + TORNEO_PHASE_DURATION_MS,
    editionStartMs: edition,
    seedNames,
    matches: buildOctavosMatchesFromSeed(seedNames),
    octavosWinners: null,
    cuartosWinners: null,
    createdAt: now,
  };
  const phaseEnd = getTorneoVotingCanonicalEndMs(draft, now) ?? draft.phaseEnd;
  return { ...draft, phaseEnd };
}

/** Cuenta atrás hasta el próximo miércoles 22:40 (inicio del torneo). */
export function createWaitingTorneoState(now = Date.now()): TorneoState {
  const phaseEnd = getUpcomingTorneoStartMs(now);
  return {
    phase: PHASES.WAITING_OCTAVOS,
    phaseEnd,
    phaseStart: now,
    editionStartMs: phaseEnd,
    nextPhaseLabel: "Octavos de Final",
    createdAt: now,
  };
}
