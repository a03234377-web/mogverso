import { sanitizeDeviceId } from "@/lib/api/sanitize-device-id";

/** Segmento estable en RTDB: `dev_<id>` sin duplicar prefijo. */
function auraDeviceIdSegment(deviceId: string): string {
  const id = sanitizeDeviceId(deviceId).replace(/\//g, "_");
  return id.startsWith("dev_") ? id : `dev_${id}`;
}

/** Ruta canónica de papeleta semanal por dispositivo. */
export function auraDeviceWeekPath(deviceId: string, weekId: string): string {
  return `auraDeviceWeek/${auraDeviceIdSegment(deviceId)}_${weekId}`;
}

/** Ruta legacy (doble `dev_`) por si hay datos antiguos. */
export function auraDeviceWeekLegacyPath(deviceId: string, weekId: string): string {
  const raw = sanitizeDeviceId(deviceId).replace(/\//g, "_");
  return `auraDeviceWeek/dev_${raw}_${weekId}`;
}

export function auraIpWeekPath(ipHash: string, weekId: string): string {
  return `auraIpWeek/ip_${ipHash}_${weekId}`;
}
