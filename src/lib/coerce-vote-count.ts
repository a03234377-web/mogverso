/** Convierte contadores RTDB a entero (legacy HTML tipo `<i>55</i>`, strings numéricos). */
export function coerceVoteCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === "string") {
    const stripped = value.replace(/<[^>]*>/g, "").trim();
    const n = Number.parseInt(stripped, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}
