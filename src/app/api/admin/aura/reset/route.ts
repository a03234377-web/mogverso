import { requireAdminBackend } from "@/lib/api/route-helpers";
import { performResetAuraVotes } from "@/lib/firebase/perform";
import { getClientIp } from "@/lib/security/client-ip";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      clearScores?: boolean;
      clearBallots?: boolean;
    };

    const ip = getClientIp(request);
    const result = await performResetAuraVotes(ip, {
      clearScores: body.clearScores,
      clearBallots: body.clearBallots,
    });

    if (!result.ok) {
      return jsonError(result.reason ?? result.error ?? "reset_failed", 400, {
        reason: result.reason ?? result.error,
      });
    }

    if (!("weekId" in result)) {
      return jsonError("reset_failed", 500);
    }

    return jsonOk({
      weekId: result.weekId,
      monthId: result.monthId,
      scoresCleared: result.scoresCleared,
      ballotsCleared: result.ballotsCleared,
    });
  } catch (err) {
    console.error("[api/admin/aura/reset]", err);
    return jsonError("reset_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
