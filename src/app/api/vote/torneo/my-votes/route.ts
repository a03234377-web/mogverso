import { guardVoteRequest, sanitizeDeviceId } from "@/lib/api/route-helpers";
import { getTorneoVotesForDevice } from "@/lib/firebase/server-vote";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { jsonError, jsonOk, serviceUnavailable } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const guard = await guardVoteRequest();
  if (guard) return guard;

  if (!isAdminConfigured()) return serviceUnavailable();

  try {
    const body = (await request.json()) as {
      deviceId?: string;
      editionStartMs?: number;
    };

    const editionStartMs = body.editionStartMs;
    if (typeof editionStartMs !== "number" || !Number.isFinite(editionStartMs)) {
      return jsonError("missing_edition", 400);
    }

    const deviceId = sanitizeDeviceId(body.deviceId);
    const votes = await getTorneoVotesForDevice(deviceId, editionStartMs);
    return jsonOk({ votes });
  } catch (err) {
    console.error("[api/vote/torneo/my-votes]", err);
    return jsonError("fetch_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
