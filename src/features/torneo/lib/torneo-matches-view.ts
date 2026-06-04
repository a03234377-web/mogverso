import { PHASES } from "@/features/torneo/data/torneo-players";
import {
  buildCuartosFromOctavosWinners,
  getOctavosWinnersForBracket,
  normalizeTorneoWinnersList,
  OCTAVOS_IDS,
} from "@/lib/torneo-bracket";
import {
  isTorneoEditionLive,
  isTorneoLegacyBreakReadyToOpen,
} from "@/lib/torneo-schedule";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";

export type TorneoMatchesView = {
  matches: Record<string, TorneoMatch>;
  ids: string[];
  round: string;
  title: string;
  canVote: boolean;
  pendingStart?: boolean;
};

function resolveCuartosMatches(state: TorneoState): Record<string, TorneoMatch> | null {
  if (state.cuartosMatches?.cua_0) return state.cuartosMatches;
  const fromList = normalizeTorneoWinnersList(state.octavosWinners, OCTAVOS_IDS.length);
  if (fromList.filter(Boolean).length >= 8) {
    return buildCuartosFromOctavosWinners(fromList);
  }
  const winners = getOctavosWinnersForBracket(state);
  if (winners.filter(Boolean).length < 2) return null;
  return buildCuartosFromOctavosWinners(winners);
}

export function getTorneoMatchesView(
  state: TorneoState | null,
  previewOctavos: Record<string, TorneoMatch> | null,
  now = Date.now(),
): TorneoMatchesView | null {
  if (!state) return null;

  if (state.phase === PHASES.CUARTOS_VOTING || state.phase === PHASES.BREAK_CUARTOS) {
    const matches = resolveCuartosMatches(state);
    if (matches) {
      const voting =
        state.phase === PHASES.CUARTOS_VOTING ||
        (state.phase === PHASES.BREAK_CUARTOS &&
          isTorneoLegacyBreakReadyToOpen(state, now));
      return {
        matches,
        ids: ["cua_0", "cua_1", "cua_2", "cua_3"],
        round: "cuartos",
        title: voting
          ? "Cuartos de Final — ¡Vota Ahora!"
          : "Cuartos de Final — duelos listos",
        canVote: voting,
      };
    }
  }

  if (
    state.phase === PHASES.SEMIFINALS_PROMO ||
    state.phase === PHASES.SEMIFINALS_VOTING
  ) {
    if (!state.semisMatches) return null;
    const voting =
      state.phase === PHASES.SEMIFINALS_VOTING ||
      (state.phase === PHASES.SEMIFINALS_PROMO &&
        isTorneoLegacyBreakReadyToOpen(state, now));
    return {
      matches: state.semisMatches,
      ids: ["semi_0", "semi_1"],
      round: "semis",
      title: voting ? "Semifinales — ¡Vota Ahora!" : "Semifinales — duelos listos",
      canVote: voting,
    };
  }

  if (state.phase === PHASES.FINAL_VOTING && state.finalMatch) {
    return {
      matches: { final_0: state.finalMatch },
      ids: ["final_0"],
      round: "final",
      title: "Gran Final — ¡Vota al Campeón!",
      canVote: true,
    };
  }

  if (state.phase === PHASES.TORNEO_ENDED && state.finalMatch) {
    return {
      matches: { final_0: state.finalMatch },
      ids: ["final_0"],
      round: "final",
      title: "Gran Final — Resultado Final",
      canVote: false,
    };
  }

  if (state.phase === PHASES.OCTAVOS_VOTING && state.matches?.oct_0) {
    return {
      matches: state.matches,
      ids: [...OCTAVOS_IDS],
      round: "octavos",
      title: "Octavos de Final — ¡Vota en todos los duelos!",
      canVote: true,
    };
  }

  if (
    state.phase === PHASES.WAITING_OCTAVOS &&
    isTorneoEditionLive(now) &&
    previewOctavos &&
    previewOctavos.oct_0
  ) {
    return {
      matches: previewOctavos,
      ids: [...OCTAVOS_IDS],
      round: "octavos",
      title: "Octavos de Final — ¡Vota en todos los duelos!",
      canVote: true,
      pendingStart: true,
    };
  }

  if (state.phase === PHASES.WAITING_OCTAVOS && state.matches?.oct_0) {
    return {
      matches: state.matches,
      ids: [...OCTAVOS_IDS],
      round: "octavos",
      title: "Octavos de Final — ¡Vota en todos los duelos!",
      canVote: false,
      pendingStart: true,
    };
  }

  return null;
}
