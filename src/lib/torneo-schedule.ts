import { PHASES } from "@/features/torneo/data/torneo-players";
import type { TorneoPhase } from "@/features/shared/lib/types";

export const TORNEO_TZ = "Europe/Madrid";
export const TORNEO_START_HOUR = 23;
export const TORNEO_START_MINUTE = 0;

type MadridParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getMadridParts(at: number): MadridParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TORNEO_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date(at))
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function getMadridWeekday(at: number): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TORNEO_TZ,
    weekday: "short",
  }).format(new Date(at));
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

function madridLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 3; i++) {
    const p = getMadridParts(utc);
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, 0);
    utc += desired - actual;
  }
  return utc;
}

function addDaysMadrid(year: number, month: number, day: number, add: number) {
  const anchor = madridLocalToUtc(year, month, day, 12, 0);
  const shifted = anchor + add * 24 * 60 * 60 * 1000;
  const p = getMadridParts(shifted);
  return { year: p.year, month: p.month, day: p.day };
}

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
  const dayName = new Intl.DateTimeFormat("es-ES", {
    timeZone: TORNEO_TZ,
    weekday: "long",
  }).format(date);
  const dateLabel = new Intl.DateTimeFormat("es-ES", {
    timeZone: TORNEO_TZ,
    day: "numeric",
    month: "long",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat("es-ES", {
    timeZone: TORNEO_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return {
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    dateLabel,
    timeLabel,
  };
}

/** Pantalla de espera hasta el próximo torneo (no la UI en vivo). */
export function shouldShowTorneoComingSoon(
  now: number,
  phase?: TorneoPhase | null,
): boolean {
  const upcomingStart = getUpcomingTorneoStartMs(now);
  if (now < upcomingStart) return true;
  if (phase === PHASES.TORNEO_ENDED) {
    return now < getUpcomingTorneoStartMs(upcomingStart + 60_000);
  }
  return false;
}
