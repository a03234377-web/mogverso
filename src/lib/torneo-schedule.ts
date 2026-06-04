import type { TorneoPhase } from "@/types/looksmax";
import {
  SPAIN_TIMEZONE,
  addDaysMadrid,
  getMadridParts,
  getMadridWeekday,
  madridLocalToUtc,
} from "@/lib/spain-time";

export const TORNEO_START_HOUR = 22;
export const TORNEO_START_MINUTE = 40;
/** 0=dom … 3=miércoles (inicio octavos, 22:40 Madrid). */
export const TORNEO_START_WEEKDAY = 3;
export const TORNEO_PHASE_DURATION_MS = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const TORNEO_DAY_NAME_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  weekday: "long",
});

const TORNEO_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  day: "numeric",
  month: "long",
});

const TORNEO_TIME_LABEL_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export type TorneoSchedulePhaseId = "octavos" | "cuartos" | "semis" | "final";

export type TorneoScheduleMilestone = {
  id: TorneoSchedulePhaseId;
  label: string;
  weekdayShort: string;
  startMs: number;
  endMs: number;
  status: "past" | "active" | "upcoming";
};

/** Instant UTC del miércoles (día de inicio) 22:40 de la semana que contiene `from`. */
export function getEditionStartMsForWeekContaining(from = Date.now()): number {
  const weekday = getMadridWeekday(from);
  const parts = getMadridParts(from);
  const daysBack = (weekday - TORNEO_START_WEEKDAY + 7) % 7;
  const target = addDaysMadrid(parts.year, parts.month, parts.day, -daysBack);
  return madridLocalToUtc(
    target.year,
    target.month,
    target.day,
    TORNEO_START_HOUR,
    TORNEO_START_MINUTE,
  );
}

/** Fin de la edición en curso (sábado 22:40 si el arranque es miércoles, 4×24 h). */
export function getEditionEndMs(editionStartMs: number): number {
  return editionStartMs + TORNEO_PHASE_DURATION_MS * 4;
}

/**
 * Próximo arranque de edición (cuenta atrás / waiting).
 * Si ya pasó el miércoles 22:40 de esta semana pero la edición sigue en curso, devuelve ese miércoles
 * (no salta +7 días — eso impedía el auto-arranque).
 */
export function getUpcomingTorneoStartMs(from = Date.now()): number {
  const thisWeekStart = getEditionStartMsForWeekContaining(from);
  const thisWeekEnd = getEditionEndMs(thisWeekStart);

  if (from < thisWeekStart) return thisWeekStart;
  if (from < thisWeekEnd) return thisWeekStart;

  return thisWeekStart + MS_PER_WEEK;
}

/** La edición semanal activa ahora (null si estamos entre ediciones). */
export function getActiveEditionStartMs(now = Date.now()): number | null {
  const start = getEditionStartMsForWeekContaining(now);
  if (now >= start && now < getEditionEndMs(start)) return start;
  return null;
}

/** @deprecated Usar getEditionEndMs */
export function getTorneoEditionEndMs(editionStartMs: number): number {
  return getEditionEndMs(editionStartMs);
}

/** Cierre de la fase en curso hoy a las 22:40 (Madrid). */
export function getTodayTorneoCloseMs(from = Date.now()): number {
  const parts = getMadridParts(from);
  return madridLocalToUtc(
    parts.year,
    parts.month,
    parts.day,
    TORNEO_START_HOUR,
    TORNEO_START_MINUTE,
  );
}

export function getTorneoMilestoneEndMs(
  editionStartMs: number,
  phaseId: TorneoSchedulePhaseId,
): number {
  const meta = MILESTONE_META.find((m) => m.id === phaseId);
  if (!meta) return editionStartMs + TORNEO_PHASE_DURATION_MS;
  return editionStartMs + (meta.dayOffset + 1) * TORNEO_PHASE_DURATION_MS;
}

const VOTING_PHASE_TO_MILESTONE: Partial<Record<TorneoPhase, TorneoSchedulePhaseId>> = {
  octavos_voting: "octavos",
  cuartos_voting: "cuartos",
  semifinals_voting: "semis",
  final_voting: "final",
};

/** Fin canónico de la fase de votación (calendario + cierre diario 22:40). */
export function getTorneoVotingCanonicalEndMs(
  state: { phase: TorneoPhase; editionStartMs?: number | null },
  now = Date.now(),
): number | null {
  const milestoneId = VOTING_PHASE_TO_MILESTONE[state.phase];
  if (!milestoneId) return null;

  const editionStart = state.editionStartMs ?? getEditionStartMsForWeekContaining(now);
  const canonical = getTorneoMilestoneEndMs(editionStart, milestoneId);
  const dailyClose = getTodayTorneoCloseMs(now);

  if (now < dailyClose && dailyClose < canonical) return dailyClose;
  return canonical;
}

/** Objetivo de cuenta atrás en `waiting_octavos` (ignora phaseEnd obsoleto en RTDB). */
export function getTorneoWaitingTargetMs(
  state: { phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): number {
  const editionStart = state.editionStartMs ?? getEditionStartMsForWeekContaining(now);
  const canonical = now < editionStart ? getUpcomingTorneoStartMs(now) : editionStart;
  if (Math.abs(state.phaseEnd - canonical) > 60_000) return canonical;
  return state.phaseEnd;
}

const TORNEO_BREAK_PHASES: TorneoPhase[] = [
  "break_cuartos",
  "semifinals_promo",
  "break_final",
];

const LEGACY_BREAK_TO_MILESTONE: Partial<Record<TorneoPhase, TorneoSchedulePhaseId>> = {
  break_cuartos: "cuartos",
  semifinals_promo: "semis",
};

/**
 * Fases `break_*` / `semifinals_promo` heredadas: abrir votación cuando el calendario
 * de la edición ya está en esa ronda (no esperar solo a `phaseEnd` de la pausa).
 */
export function isTorneoLegacyBreakReadyToOpen(
  state: { phase: TorneoPhase; editionStartMs?: number | null },
  now = Date.now(),
): boolean {
  const milestoneId = LEGACY_BREAK_TO_MILESTONE[state.phase];
  if (!milestoneId) return false;
  const editionStart = state.editionStartMs ?? getEditionStartMsForWeekContaining(now);
  const milestone = getTorneoPhaseSchedule(editionStart, now).find(
    (m) => m.id === milestoneId,
  );
  return milestone?.status === "active";
}

/** Cuenta atrás visible en la tarjeta de fase (votación, espera o pausa). */
export function getTorneoPhaseCountdownTargetMs(
  state: { phase: TorneoPhase; phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): number {
  if (state.phase === "waiting_octavos") {
    return getTorneoWaitingTargetMs(state, now);
  }
  if (TORNEO_BREAK_PHASES.includes(state.phase)) {
    return state.phaseEnd;
  }
  return getTorneoVotingTargetMs(state, now);
}

/** Objetivo de cuenta atrás en fases de votación (siempre el cierre canónico en UI). */
export function getTorneoVotingTargetMs(
  state: { phase: TorneoPhase; phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): number {
  const canonical = getTorneoVotingCanonicalEndMs(state, now);
  if (canonical == null) return state.phaseEnd;
  return canonical;
}

const PHASE_EXPIRE_GRACE_MS = 2000;

/** La fase de votación terminó (calendario 22:40 o `phaseEnd` en RTDB). */
export function isTorneoVotingPhaseExpired(
  state: { phase: TorneoPhase; phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): boolean {
  const canonical = getTorneoVotingCanonicalEndMs(state, now);
  if (canonical != null && canonical <= now - PHASE_EXPIRE_GRACE_MS) return true;
  return state.phaseEnd <= now - PHASE_EXPIRE_GRACE_MS;
}

/** Cuenta atrás de espera u hora canónica de votación agotada. */
export function isTorneoPhaseExpired(
  state: { phase: TorneoPhase; phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): boolean {
  if (state.phase === "waiting_octavos") {
    return getTorneoWaitingTargetMs(state, now) <= now - PHASE_EXPIRE_GRACE_MS;
  }
  if (VOTING_PHASE_TO_MILESTONE[state.phase]) {
    return isTorneoVotingPhaseExpired(state, now);
  }
  return state.phaseEnd <= now - PHASE_EXPIRE_GRACE_MS;
}

export function formatTorneoStartDate(ms: number) {
  const date = new Date(ms);
  const dayName = TORNEO_DAY_NAME_FORMATTER.format(date);
  const dateLabel = TORNEO_DATE_LABEL_FORMATTER.format(date);
  const timeLabel = TORNEO_TIME_LABEL_FORMATTER.format(date);

  return {
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    dateLabel,
    timeLabel,
  };
}

const MILESTONE_META: {
  id: TorneoSchedulePhaseId;
  label: string;
  weekdayShort: string;
  dayOffset: number;
}[] = [
  { id: "octavos", label: "Octavos de Final", weekdayShort: "Mié", dayOffset: 0 },
  { id: "cuartos", label: "Cuartos de Final", weekdayShort: "Jue", dayOffset: 1 },
  { id: "semis", label: "Semifinales", weekdayShort: "Vie", dayOffset: 2 },
  { id: "final", label: "Gran Final", weekdayShort: "Sáb", dayOffset: 3 },
];

export function getTorneoPhaseSchedule(
  editionStartMs: number,
  now = Date.now(),
): TorneoScheduleMilestone[] {
  return MILESTONE_META.map((meta) => {
    const startMs = editionStartMs + meta.dayOffset * TORNEO_PHASE_DURATION_MS;
    const endMs = startMs + TORNEO_PHASE_DURATION_MS;
    let status: TorneoScheduleMilestone["status"] = "upcoming";
    if (now >= endMs) status = "past";
    else if (now >= startMs) status = "active";

    return {
      id: meta.id,
      label: meta.label,
      weekdayShort: meta.weekdayShort,
      startMs,
      endMs,
      status,
    };
  });
}

export function getActiveScheduleMilestone(
  editionStartMs: number,
  now = Date.now(),
): TorneoScheduleMilestone | null {
  return (
    getTorneoPhaseSchedule(editionStartMs, now).find((m) => m.status === "active") ??
    null
  );
}

/**
 * Antes del miércoles de inicio, Firebase no debe quedar en fase intermedia.
 */
export function shouldForceTorneoWaitingBeforeStart(
  now: number,
  phase?: TorneoPhase | null,
): boolean {
  const editionStart = getUpcomingTorneoStartMs(now);
  if (now >= editionStart) return false;
  if (!phase || phase === "waiting_octavos") return false;
  if (phase === "torneo_ended") return false;
  return true;
}

/** Pantalla de espera hasta el próximo torneo (no la UI en vivo). */
export function shouldShowTorneoComingSoon(
  now: number,
  phase?: TorneoPhase | null,
): boolean {
  const editionStart = getEditionStartMsForWeekContaining(now);
  if (now >= editionStart && now < getEditionEndMs(editionStart)) {
    return false;
  }
  const upcomingStart = getUpcomingTorneoStartMs(now);
  if (now < upcomingStart) return true;
  if (phase === "torneo_ended") {
    return now < getUpcomingTorneoStartMs(upcomingStart + 60_000);
  }
  return false;
}

export function isTorneoEditionLive(now = Date.now()): boolean {
  const start = getEditionStartMsForWeekContaining(now);
  return now >= start && now < getEditionEndMs(start);
}
