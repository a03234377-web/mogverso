import { requireAdminBackend } from "@/lib/api/route-helpers";
import { adminResetTorneo } from "@/lib/firebase/server-torneo";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const state = await adminResetTorneo();
    return jsonOk({ state });
  } catch (err) {
    console.error("[api/admin/torneo/reset]", err);
    return jsonError("reset_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
