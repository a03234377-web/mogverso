/** Segmento estable para RTDB/API (sin depender de firebase-admin). */
export function sanitizeDeviceId(raw: unknown): string {
  if (typeof raw !== "string") return "unknown_device";
  const trimmed = raw.trim().slice(0, 64);
  return trimmed || "unknown_device";
}
