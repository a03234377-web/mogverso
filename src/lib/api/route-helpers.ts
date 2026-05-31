import { isAdminConfigured } from "@/lib/firebase/admin";
import { serviceUnavailable } from "@/lib/security/api-response";

export async function requireAdminBackend() {
  if (!isAdminConfigured()) return serviceUnavailable();
  return null;
}

/** Comprueba Admin SDK; rate limit y reCAPTCHA van en `perform.ts`. */
export async function guardVoteRequest() {
  return requireAdminBackend();
}

/** Comprueba Admin SDK; rate limit va en `perform.ts`. */
export async function guardHealRequest() {
  return requireAdminBackend();
}

export function sanitizeDeviceId(raw: unknown): string {
  if (typeof raw !== "string") return "unknown_device";
  const trimmed = raw.trim().slice(0, 64);
  return trimmed || "unknown_device";
}
