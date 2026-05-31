import { guardVoteRequest, sanitizeDeviceId } from "@/lib/api/route-helpers";
import { performEntryVote } from "@/lib/firebase/perform";
import { getClientIp } from "@/lib/security/client-ip";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const guard = await guardVoteRequest();
  if (guard) return guard;

  try {
    const body = (await request.json()) as {
      candidateId?: string;
      deviceId?: string;
      recaptchaToken?: string;
    };

    const candidateId = body.candidateId?.trim();
    if (!candidateId) return jsonError("missing_candidate", 400);

    const deviceId = sanitizeDeviceId(body.deviceId);
    const ip = getClientIp(request);
    const result = await performEntryVote(
      candidateId,
      deviceId,
      ip,
      body.recaptchaToken,
    );

    if (!result.ok) {
      return jsonError(result.reason ?? result.error ?? "vote_failed", 400, {
        reason: result.reason ?? result.error,
      });
    }

    return jsonOk({});
  } catch (err) {
    console.error("[api/vote/entry]", err);
    return jsonError("vote_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
