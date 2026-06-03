import type { TorneoPhase } from "@/types/looksmax";
import {
  SPAIN_TIMEZONE,
  addDaysMadrid,
  getMadridParts,
  getMadridWeekday,
  madridLocalToUtc,
} from "@/lib/spain-time";

export const TORNEO_START_HOUR = 22;
export const TORNEO_START_MINUTE = 30;
/** 0=dom … 3=miércoles (inicio octavos, 22:30 Madrid). */
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

/** Instant UTC del miércoles (día de inicio) 22:30 de la semana que contiene `from`. */
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

/** Fin de la edición en curso (sábado 22:30 si el arranque es miércoles, 4×24 h). */
export function getEditionEndMs(editionStartMs: number): number {
  return editionStartMs + TORNEO_PHASE_DURATION_MS * 4;
}

/**
 * Próximo arranque de edición (cuenta atrás / waiting).
 * Si ya pasó el miércoles 22:30 de esta semana pero la edición sigue en curso, devuelve ese miércoles
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

/** Objetivo de cuenta atrás en `waiting_octavos` (ignora phaseEnd obsoleto en RTDB). */
export function getTorneoWaitingTargetMs(
  state: { phaseEnd: number; editionStartMs?: number | null },
  now = Date.now(),
): number {
  const editionStart =
    state.editionStartMs ?? getEditionStartMsForWeekContaining(now);
  const canonical =
    now < editionStart ? getUpcomingTorneoStartMs(now) : editionStart;
  if (Math.abs(state.phaseEnd - canonical) > 60_000) return canonical;
  return state.phaseEnd;
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
