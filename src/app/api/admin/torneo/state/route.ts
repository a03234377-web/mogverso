import { requireAdminBackend } from "@/lib/api/route-helpers";
import { getTorneoState } from "@/lib/firebase/server-torneo";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";
import { formatTorneoStartDate } from "@/lib/torneo-schedule";

export async function GET(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const state = await getTorneoState();
    const phaseEndLabel = state?.phaseEnd
      ? formatTorneoStartDate(state.phaseEnd)
      : null;
    return jsonOk({ state, phaseEndLabel });
  } catch (err) {
    console.error("[api/admin/torneo/state]", err);
    return jsonError("read_failed", 500);
  }
}
