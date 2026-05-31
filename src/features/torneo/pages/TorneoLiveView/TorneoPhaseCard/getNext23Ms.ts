/** Próximo reinicio del torneo a las 23:00 (hora local). */
export function getNext23Ms(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target.getTime();
}
