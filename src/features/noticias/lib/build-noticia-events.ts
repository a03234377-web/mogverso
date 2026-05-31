import type { Mover } from "@/features/rankings/lib/ranking";
import { PHASES } from "@/features/torneo/data/torneo-players";
import type { TorneoState } from "@/types/looksmax";
import type { NoticiaEvent, RankVoteHistoryRow } from "./noticia-event";

const MAX_EVENTS = 20;

function pluralPuestos(n: number): string {
  return n === 1 ? "1 puesto" : `${n} puestos`;
}

function moverUpEvent(m: Mover): NoticiaEvent {
  return {
    id: `up-${m.ts}-${m.name}`,
    ts: m.ts,
    kind: "subida",
    cat: "ascension",
    catIcon: "trending-up",
    catLabel: "Ascensión",
    title: `${m.name} sube ${pluralPuestos(m.delta)} — ahora #${m.rank}`,
    body: `Tras la última votación, ${m.name} gana ${pluralPuestos(m.delta)} en el ranking oficial y queda en la posición #${m.rank}.`,
    tag: "SUBIDA",
    profileNames: [m.name],
  };
}

function moverDownEvent(m: Mover): NoticiaEvent {
  return {
    id: `down-${m.ts}-${m.name}`,
    ts: m.ts,
    kind: "bajada",
    cat: "ranking",
    catIcon: "trending-down",
    catLabel: "Ranking",
    title: `${m.name} baja ${pluralPuestos(m.delta)} — ahora #${m.rank}`,
    body: `${m.name} cede ${pluralPuestos(m.delta)} en la tabla y pasa a la posición #${m.rank}.`,
    tag: "BAJADA",
    profileNames: [m.name],
  };
}

function rankVoteEvent(row: RankVoteHistoryRow): NoticiaEvent {
  const posNote =
    row.winnerNewPos !== undefined
      ? ` y queda en el #${row.winnerNewPos}`
      : row.winnerPos !== undefined
        ? ` (posición #${row.winnerPos})`
        : "";
  return {
    id: row.id ? `rv-${row.id}` : `rv-${row.ts}-${row.winner}-${row.loser}`,
    ts: row.ts,
    kind: "rankvote",
    cat: "drama",
    catIcon: "vote",
    catLabel: "Rank Vote",
    title: `${row.winner} vence a ${row.loser} en Rank Vote`,
    body: `Resultado: ${row.wVotes} votos a ${row.wVotes + row.lVotes} totales. ${row.winner} gana el duelo${posNote}.`,
    tag: "VOTACIÓN",
    profileNames: [row.winner, row.loser],
  };
}

function torneoPhaseLabel(phase: TorneoState["phase"]): string | null {
  switch (phase) {
    case PHASES.CUARTOS_VOTING:
      return "cuartos de final";
    case PHASES.SEMIFINALS_VOTING:
      return "semifinales";
    case PHASES.FINAL_VOTING:
      return "gran final";
    case PHASES.WAITING_OCTAVOS:
      return "cuenta atrás al torneo";
    case PHASES.BREAK_FINAL:
      return "pausa antes de la final";
    default:
      return null;
  }
}

function torneoEvent(state: TorneoState): NoticiaEvent | null {
  const ts = state.phaseStart ?? state.createdAt ?? state.phaseEnd;
  if (!ts) return null;

  if (state.phase === PHASES.TORNEO_ENDED && state.champion) {
    return {
      id: `torneo-champion-${ts}-${state.champion}`,
      ts,
      kind: "torneo",
      cat: "comunidad",
      catIcon: "trophy",
      catLabel: "Torneo",
      title: `${state.champion} gana el torneo LooksMax`,
      body: `El torneo ha terminado y ${state.champion} se corona campeón de la edición en curso.`,
      tag: "CAMPEÓN",
      profileNames: [state.champion],
    };
  }

  const phaseLabel = torneoPhaseLabel(state.phase);
  if (!phaseLabel) return null;

  const livePhases = new Set<string>([
    PHASES.CUARTOS_VOTING,
    PHASES.SEMIFINALS_VOTING,
    PHASES.FINAL_VOTING,
  ]);

  return {
    id: `torneo-phase-${state.phase}-${ts}`,
    ts,
    kind: "torneo",
    cat: "comunidad",
    catIcon: livePhases.has(state.phase) ? "radio" : "goal",
    catLabel: "Torneo",
    title: livePhases.has(state.phase)
      ? `Torneo en vivo: ${phaseLabel}`
      : `Torneo: ${phaseLabel}`,
    body: livePhases.has(state.phase)
      ? `La fase de ${phaseLabel} está activa. Entra al torneo y vota tus partidos favoritos.`
      : `El torneo avanza hacia ${phaseLabel}. Sigue la competición en la sección Torneo.`,
    tag: livePhases.has(state.phase) ? "EN VIVO" : "TORNEO",
    profileNames: [],
  };
}

export type NoticiaEventsInput = {
  upMovers: Mover[];
  downMovers: Mover[];
  rankVoteHistory: RankVoteHistoryRow[];
  torneoState: TorneoState | null;
};

export function buildNoticiaEvents(input: NoticiaEventsInput): NoticiaEvent[] {
  const events: NoticiaEvent[] = [];

  for (const m of input.upMovers) {
    if (m.ts > 0 && m.delta > 0) events.push(moverUpEvent(m));
  }
  for (const m of input.downMovers) {
    if (m.ts > 0 && m.delta > 0) events.push(moverDownEvent(m));
  }
  for (const row of input.rankVoteHistory) {
    if (row.winner && row.loser && row.ts > 0) events.push(rankVoteEvent(row));
  }
  if (input.torneoState) {
    const te = torneoEvent(input.torneoState);
    if (te) events.push(te);
  }

  const seen = new Set<string>();
  return events
    .sort((a, b) => b.ts - a.ts)
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .slice(0, MAX_EVENTS);
}
