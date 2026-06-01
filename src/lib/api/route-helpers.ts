import { sanitizeDeviceId } from "@/lib/api/sanitize-device-id";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { serviceUnavailable } from "@/lib/security/api-response";

export { sanitizeDeviceId };

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
