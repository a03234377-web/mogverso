import { addDaysMadrid, getMadridParts, getMadridWeekday } from "@/lib/spain-time";

/** Lunes de la semana actual en hora de España (clave de cupo semanal). */
export function getMadridWeekId(at = Date.now()): string {
  const p = getMadridParts(at);
  const weekday = getMadridWeekday(at);
  const daysFromMonday = (weekday + 6) % 7;
  const monday = addDaysMadrid(p.year, p.month, p.day, -daysFromMonday);
  const mm = String(monday.month).padStart(2, "0");
  const dd = String(monday.day).padStart(2, "0");
  return `${monday.year}-${mm}-${dd}`;
}

/** Mes calendario en hora de España (reinicio mensual de puntuaciones). */
export function getMadridMonthId(at = Date.now()): string {
  const p = getMadridParts(at);
  const mm = String(p.month).padStart(2, "0");
  return `${p.year}-${mm}`;
}
