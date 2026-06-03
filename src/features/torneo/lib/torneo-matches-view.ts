import { PHASES } from "@/features/torneo/data/torneo-players";
import { OCTAVOS_IDS } from "@/lib/torneo-bracket";
import { isTorneoEditionLive } from "@/lib/torneo-schedule";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";

export type TorneoMatchesView = {
  matches: Record<string, TorneoMatch>;
  ids: string[];
  round: string;
  title: string;
  canVote: boolean;
  pendingStart?: boolean;
};

export function getTorneoMatchesView(
  state: TorneoState | null,
  previewOctavos: Record<string, TorneoMatch> | null,
  now = Date.now(),
): TorneoMatchesView | null {
  if (!state) return null;

  if (
    (state.phase === PHASES.OCTAVOS_VOTING || state.matches?.oct_0) &&
    state.matches
  ) {
    return {
      matches: state.matches,
      ids: [...OCTAVOS_IDS],
      round: "octavos",
      title: "Octavos de Final — ¡Vota en todos los duelos!",
      canVote: state.phase === PHASES.OCTAVOS_VOTING,
      pendingStart: state.phase === PHASES.WAITING_OCTAVOS,
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

  if (state.phase === PHASES.CUARTOS_VOTING && state.cuartosMatches) {
    return {
      matches: state.cuartosMatches,
      ids: ["cua_0", "cua_1", "cua_2", "cua_3"],
      round: "cuartos",
      title: "Cuartos de Final — ¡Vota Ahora!",
      canVote: true,
    };
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING && state.semisMatches) {
    return {
      matches: state.semisMatches,
      ids: ["semi_0", "semi_1"],
      round: "semis",
      title: "Semifinales — ¡Vota Ahora!",
      canVote: true,
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

  return null;
}
