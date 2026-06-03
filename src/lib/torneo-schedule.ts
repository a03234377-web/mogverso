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
/** 0=dom … 3=miércoles (inicio octavos). */
export const TORNEO_START_WEEKDAY = 3;
export const TORNEO_PHASE_DURATION_MS = 24 * 60 * 60 * 1000;

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

/** Próximo miércoles 22:30 (Europe/Madrid). Si hoy es miércoles antes de las 22:30, devuelve hoy. */
export function getUpcomingTorneoStartMs(from = Date.now()): number {
  const weekday = getMadridWeekday(from);
  const start = getMadridParts(from);
  let daysUntilStart: number;

  if (weekday === TORNEO_START_WEEKDAY) {
    const pastStart =
      start.hour > TORNEO_START_HOUR ||
      (start.hour === TORNEO_START_HOUR && start.minute >= TORNEO_START_MINUTE);
    daysUntilStart = pastStart ? 7 : 0;
  } else {
    daysUntilStart = (TORNEO_START_WEEKDAY - weekday + 7) % 7;
  }

  const target = addDaysMadrid(start.year, start.month, start.day, daysUntilStart);
  return madridLocalToUtc(
    target.year,
    target.month,
    target.day,
    TORNEO_START_HOUR,
    TORNEO_START_MINUTE,
  );
}

export function getTorneoEditionEndMs(editionStartMs: number): number {
  return editionStartMs + TORNEO_PHASE_DURATION_MS * 4;
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
  { id: "final", label: "Gran Final", weekdayShort: "Dom", dayOffset: 3 },
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
  const upcomingStart = getUpcomingTorneoStartMs(now);
  if (now < upcomingStart) return true;
  if (phase === "torneo_ended") {
    return now < getUpcomingTorneoStartMs(upcomingStart + 60_000);
  }
  return false;
}
