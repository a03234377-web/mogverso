/** Zona horaria oficial del proyecto (Península y Baleares). */
export const SPAIN_TIMEZONE = "Europe/Madrid";

/** Etiqueta para mostrar junto a fechas/horas en la UI. */
export const SPAIN_TIMEZONE_LABEL = "hora peninsular (CET/CEST)";

const MADRID_PARTS_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: SPAIN_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const MADRID_WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: SPAIN_TIMEZONE,
  weekday: "short",
});

const SPAIN_TIME_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const SPAIN_DATE_SHORT_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  day: "numeric",
  month: "short",
});

const SPAIN_DATE_COMPACT_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const SPAIN_WEEKDAY_LONG_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  weekday: "long",
});

const SPAIN_DATE_LONG_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  timeZone: SPAIN_TIMEZONE,
  day: "numeric",
  month: "long",
});

export type MadridParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function getMadridParts(at: number): MadridParts {
  const parts = Object.fromEntries(
    MADRID_PARTS_FORMATTER.formatToParts(new Date(at)).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function getMadridWeekday(at: number): number {
  const wd = MADRID_WEEKDAY_FORMATTER.format(new Date(at));
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

export function madridLocalToUtc(
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

export function addDaysMadrid(year: number, month: number, day: number, add: number) {
  const anchor = madridLocalToUtc(year, month, day, 12, 0);
  const shifted = anchor + add * 24 * 60 * 60 * 1000;
  const p = getMadridParts(shifted);
  return { year: p.year, month: p.month, day: p.day };
}

export function isSameCalendarDayInSpain(a: number, b: number): boolean {
  const pa = getMadridParts(a);
  const pb = getMadridParts(b);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

/** Hora en España (p. ej. «18:45»). */
export function formatSpainTime(ts: number): string {
  return SPAIN_TIME_FORMATTER.format(new Date(ts));
}

/** Fecha corta en España (p. ej. «31 may»). */
export function formatSpainDateShort(ts: number): string {
  return SPAIN_DATE_SHORT_FORMATTER.format(new Date(ts)).replace(".", "");
}

/** Fecha y hora compactas (p. ej. «31/05, 18:45»). */
export function formatSpainDateTimeCompact(ts: number): string {
  return SPAIN_DATE_COMPACT_FORMATTER.format(new Date(ts));
}

/** Hora exacta del evento (p. ej. «Hoy, 18:45» o «31 may, 18:45»). */
export function formatEventTime(ts: number, now = Date.now()): string {
  const clock = formatSpainTime(ts);

  if (isSameCalendarDayInSpain(ts, now)) {
    return `Hoy, ${clock}`;
  }

  return `${formatSpainDateShort(ts)}, ${clock}`;
}

/** Día de la semana y fecha larga en España (p. ej. «Viernes» + «31 de mayo»). */
export function formatSpainWeekdayDate(ts: number) {
  const weekday = SPAIN_WEEKDAY_LONG_FORMATTER.format(new Date(ts));
  const dateLabel = SPAIN_DATE_LONG_FORMATTER.format(new Date(ts));

  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dateLabel,
  };
}

/** Próximo instante a las 23:00 en hora peninsular. */
export function getNextMadrid23Ms(from = Date.now()): number {
  const start = getMadridParts(from);
  const today23 = madridLocalToUtc(start.year, start.month, start.day, 23, 0);
  if (from < today23) return today23;

  const tomorrow = addDaysMadrid(start.year, start.month, start.day, 1);
  return madridLocalToUtc(tomorrow.year, tomorrow.month, tomorrow.day, 23, 0);
}
