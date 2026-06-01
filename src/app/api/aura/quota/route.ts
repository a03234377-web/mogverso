import { sanitizeDeviceId } from "@/lib/api/route-helpers";
import { ensureAuraPeriods, readAuraDeviceWeekBallot } from "@/lib/firebase/server-aura";
import { AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { getMadridWeekId } from "@/lib/aura/periods";
import { ballotVotedNames } from "@/lib/aura/week-ballot";
import { jsonError, jsonOk, serviceUnavailable } from "@/lib/security/api-response";
import { isAdminConfigured } from "@/lib/firebase/admin";

export async function GET(request: Request) {
  if (!isAdminConfigured()) return serviceUnavailable();

  try {
    const { searchParams } = new URL(request.url);
    const deviceId = sanitizeDeviceId(searchParams.get("deviceId"));
    const meta = await ensureAuraPeriods();
    const weekId = meta.weekId || getMadridWeekId();

    const ballot = await readAuraDeviceWeekBallot(deviceId, weekId);
    const votesUsed = ballot.used;
    const votedNames = ballotVotedNames(ballot);

    return jsonOk({
      weekId,
      votesUsed,
      votesRemaining: Math.max(0, AURA_VOTES_PER_WEEK - votesUsed),
      votedNames,
    });
  } catch (err) {
    console.error("[api/aura/quota]", err);
    return jsonError("quota_failed", 500);
  }
}
