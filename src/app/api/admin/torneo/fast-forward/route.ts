import { requireAdminBackend } from "@/lib/api/route-helpers";
import { fastForwardTorneoPhase } from "@/lib/firebase/server-torneo";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const state = await fastForwardTorneoPhase();
    if (!state) return jsonError("no_state", 404);
    return jsonOk({ state });
  } catch (err) {
    console.error("[api/admin/torneo/fast-forward]", err);
    return jsonError("fast_forward_failed", 500);
  }
}
