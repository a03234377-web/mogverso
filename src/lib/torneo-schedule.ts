import type { TorneoPhase } from "@/types/looksmax";
import {
  SPAIN_TIMEZONE,
  addDaysMadrid,
  getMadridParts,
  getMadridWeekday,
  madridLocalToUtc,
} from "@/lib/spain-time";

const TORNEO_START_HOUR = 23;
const TORNEO_START_MINUTE = 0;

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

/** Próximo viernes 23:00 (Europe/Madrid). Si hoy es viernes antes de las 23:00, devuelve hoy. */
export function getUpcomingTorneoStartMs(from = Date.now()): number {
  const weekday = getMadridWeekday(from);
  const start = getMadridParts(from);
  let daysUntilFriday: number;

  if (weekday === 5) {
    const pastStart =
      start.hour > TORNEO_START_HOUR ||
      (start.hour === TORNEO_START_HOUR && start.minute >= TORNEO_START_MINUTE);
    daysUntilFriday = pastStart ? 7 : 0;
  } else {
    daysUntilFriday = (5 - weekday + 7) % 7;
  }

  const target = addDaysMadrid(start.year, start.month, start.day, daysUntilFriday);
  return madridLocalToUtc(
    target.year,
    target.month,
    target.day,
    TORNEO_START_HOUR,
    TORNEO_START_MINUTE,
  );
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

/**
 * Antes del viernes de inicio, Firebase no debe quedar en fase intermedia
 * (p. ej. break_final): parece “espera de la gran final” en vez de arranque desde cero.
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
