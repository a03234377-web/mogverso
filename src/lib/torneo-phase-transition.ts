import { PHASES } from "@/features/torneo/data/torneo-players";
import {
  buildCuartosFromOctavosWinners,
  buildFinalMatch,
  buildSemisMatches,
  CUARTOS_IDS,
  OCTAVOS_IDS,
  resolveRoundMatches,
  SEMIS_IDS,
} from "@/lib/torneo-bracket";
import {
  getTorneoVotingCanonicalEndMs,
  isTorneoVotingPhaseExpired,
} from "@/lib/torneo-schedule";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";

const SYNC_TOLERANCE_MS = 60_000;

/**
 * Invariantes del torneo (timer, heal, avance y UI deben usar lo mismo):
 * - Cierre de fase: getTorneoVotingCanonicalEndMs + isTorneoPhaseExpired
 * - Cuenta atrás UI: getTorneoVotingTargetMs (no phaseEnd crudo si difiere >1 min)
 * - Lista de duelos: getTorneoMatchesView (por phase, nunca por matches.oct_0 solo)
 * - Tras avanzar octavos→cuartos: octavosWinners (8 slots) + cuartosMatches obligatorios
 */

export function withCanonicalVotingPhaseEnd(
  state: TorneoState,
  now = Date.now(),
): TorneoState {
  const canonical = getTorneoVotingCanonicalEndMs(state, now);
  if (canonical == null) return state;
  if (Math.abs(state.phaseEnd - canonical) <= SYNC_TOLERANCE_MS) return state;
  return { ...state, phaseEnd: canonical };
}

function finalizeVotingPhaseEnd(draft: TorneoState, now: number): TorneoState {
  const phaseEnd = getTorneoVotingCanonicalEndMs(draft, now) ?? draft.phaseEnd;
  return { ...draft, phaseEnd };
}

export function buildOctavosToCuartosState(
  state: TorneoState,
  now: number,
): TorneoState {
  const resolved = resolveRoundMatches(OCTAVOS_IDS, state.matches || {});
  const draft: TorneoState = {
    ...state,
    phase: PHASES.CUARTOS_VOTING,
    phaseStart: now,
    phaseEnd: now + 86_400_000,
    octavosWinners: resolved.winners,
    matches: resolved.updatedMatches,
    cuartosMatches: buildCuartosFromOctavosWinners(resolved.winners),
  };
  return finalizeVotingPhaseEnd(draft, now);
}

export function buildCuartosToSemisState(state: TorneoState, now: number): TorneoState {
  const resolved = resolveRoundMatches(CUARTOS_IDS, state.cuartosMatches || {});
  const draft: TorneoState = {
    ...state,
    phase: PHASES.SEMIFINALS_VOTING,
    phaseStart: now,
    phaseEnd: now + 86_400_000,
    cuartosWinners: resolved.winners,
    cuartosMatches: resolved.updatedMatches,
    semisMatches: buildSemisMatches(resolved.winners),
  };
  return finalizeVotingPhaseEnd(draft, now);
}

export function buildSemisToFinalState(state: TorneoState, now: number): TorneoState {
  const resolved = resolveRoundMatches(SEMIS_IDS, state.semisMatches || {});
  const draft: TorneoState = {
    ...state,
    phase: PHASES.FINAL_VOTING,
    phaseStart: now,
    phaseEnd: now + 86_400_000,
    semisWinners: resolved.winners.filter((w): w is string => w !== null),
    semisMatches: resolved.updatedMatches,
    finalMatch: buildFinalMatch(resolved.winners),
  };
  return finalizeVotingPhaseEnd(draft, now);
}

function roundMatchesMissing(
  matches: Record<string, TorneoMatch> | undefined,
  firstId: string,
): boolean {
  const m = matches?.[firstId];
  if (!m) return true;
  return !m.p1 || m.p1 === "TBD" || !m.p2 || m.p2 === "TBD";
}

/** Repara emparejamientos de la ronda activa si la fase avanzó sin RTDB completo. */
export function repairActiveRoundMatches(
  state: TorneoState,
  now = Date.now(),
): Partial<TorneoState> | null {
  if (
    (state.phase === PHASES.CUARTOS_VOTING || state.phase === PHASES.BREAK_CUARTOS) &&
    roundMatchesMissing(state.cuartosMatches, "cua_0") &&
    state.matches?.oct_0
  ) {
    const next = buildOctavosToCuartosState(state, now);
    return {
      matches: next.matches,
      octavosWinners: next.octavosWinners,
      cuartosMatches: next.cuartosMatches,
      phaseEnd: next.phaseEnd,
    };
  }

  if (
    state.phase === PHASES.SEMIFINALS_VOTING &&
    roundMatchesMissing(state.semisMatches, "semi_0") &&
    state.cuartosMatches?.cua_0
  ) {
    const resolved = resolveRoundMatches(CUARTOS_IDS, state.cuartosMatches);
    const draft: TorneoState = {
      ...state,
      cuartosWinners: resolved.winners,
      cuartosMatches: resolved.updatedMatches,
      semisMatches: buildSemisMatches(resolved.winners),
    };
    const phaseEnd = getTorneoVotingCanonicalEndMs(draft, now) ?? state.phaseEnd;
    return {
      cuartosWinners: draft.cuartosWinners,
      cuartosMatches: draft.cuartosMatches,
      semisMatches: draft.semisMatches,
      phaseEnd,
    };
  }

  return null;
}

/** Abre la votación tras una pausa (`break_*` / `semifinals_promo` en RTDB). */
export function openBreakToVotingState(
  state: TorneoState,
  now: number,
): TorneoState | null {
  if (state.phase === PHASES.BREAK_CUARTOS) {
    const draft: TorneoState = {
      ...state,
      phase: PHASES.CUARTOS_VOTING,
      phaseStart: now,
      phaseEnd: now + 86_400_000,
    };
    return finalizeVotingPhaseEnd(draft, now);
  }

  if (state.phase === PHASES.SEMIFINALS_PROMO) {
    const draft: TorneoState = {
      ...state,
      phase: PHASES.SEMIFINALS_VOTING,
      phaseStart: now,
      phaseEnd: now + 86_400_000,
    };
    return finalizeVotingPhaseEnd(draft, now);
  }

  return null;
}

/**
 * Avanza pausas heredadas (`break_cuartos`, `semifinals_promo`).
 * Si el calendario ya cerró la ronda intermedia, salta a la siguiente fase de votación.
 */
export function resolveLegacyBreakAdvanceState(
  state: TorneoState,
  now: number,
): TorneoState | null {
  if (state.phase === PHASES.BREAK_CUARTOS) {
    const asCuartos: TorneoState = { ...state, phase: PHASES.CUARTOS_VOTING };
    if (isTorneoVotingPhaseExpired(asCuartos, now)) {
      let base = state;
      if (!state.cuartosMatches?.cua_0) {
        if (!state.matches?.oct_0) return null;
        base = buildOctavosToCuartosState(state, now);
      }
      return buildCuartosToSemisState(base, now);
    }
    return openBreakToVotingState(state, now);
  }

  if (state.phase === PHASES.SEMIFINALS_PROMO) {
    const asSemis: TorneoState = { ...state, phase: PHASES.SEMIFINALS_VOTING };
    if (isTorneoVotingPhaseExpired(asSemis, now)) {
      let base = state;
      if (!state.semisMatches?.semi_0) {
        if (!state.cuartosMatches?.cua_0) return null;
        base = buildCuartosToSemisState(state, now);
      }
      return buildSemisToFinalState(base, now);
    }
    return openBreakToVotingState(state, now);
  }

  return null;
}
