import { guardVoteRequest, sanitizeDeviceId } from "@/lib/api/route-helpers";
import { performAuraVote } from "@/lib/firebase/perform";
import { getClientIp } from "@/lib/security/client-ip";
import { jsonError, jsonOk } from "@/lib/security/api-response";
import type { AuraVoteKind } from "@/types/aura";

function parseKind(value: unknown): AuraVoteKind | null {
  if (value === "boost" || value === "penalty") return value;
  return null;
}

export async function POST(request: Request) {
  const guard = await guardVoteRequest();
  if (guard) return guard;

  try {
    const body = (await request.json()) as {
      name?: string;
      kind?: string;
      deviceId?: string;
      recaptchaToken?: string;
    };

    const name = body.name?.trim();
    if (!name) return jsonError("invalid_candidate", 400);

    const kind = parseKind(body.kind);
    if (!kind) return jsonError("invalid_candidate", 400);

    const deviceId = sanitizeDeviceId(body.deviceId);
    const ip = getClientIp(request);
    const result = await performAuraVote(name, kind, deviceId, ip, body.recaptchaToken);

    if (!result.ok) {
      return jsonError(result.reason ?? result.error ?? "vote_failed", 400, {
        reason: result.reason ?? result.error,
      });
    }

    return jsonOk({
      votesRemaining: result.votesRemaining,
      aura: result.aura,
      delta: result.delta,
      weekId: result.weekId,
      votedNames: result.votedNames,
    });
  } catch (err) {
    console.error("[api/vote/aura]", err);
    return jsonError("vote_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
