"use server";

import {
  performHealTorneo,
  performTorneoVote,
  type ActionResult,
} from "@/lib/firebase/perform";
import { getTorneoVotesForDevice } from "@/lib/firebase/server-vote";
import {
  assertHealServerAction,
  assertVoteServerAction,
} from "@/lib/security/server-action-auth";

export async function submitTorneoVote(
  matchId: string,
  candidateName: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const { deviceId: sanitized, ip } = await assertVoteServerAction(deviceId);
  return performTorneoVote(matchId, candidateName, sanitized, ip, recaptchaToken);
}

export async function healTorneoAction(options?: {
  restartIfEnded?: boolean;
}): Promise<ActionResult> {
  const ip = await assertHealServerAction();
  return performHealTorneo(ip, options);
}

export async function fetchTorneoMyVotesAction(
  deviceId: string,
  editionStartMs: number,
): Promise<ActionResult & { votes?: Record<string, string> }> {
  try {
    const { deviceId: sanitized } = await assertVoteServerAction(deviceId);
    const votes = await getTorneoVotesForDevice(sanitized, editionStartMs);
    return { ok: true, votes };
  } catch (err) {
    const reason =
      err instanceof Error && err.message === "server_not_configured"
        ? "server_not_configured"
        : "fetch_failed";
    return { ok: false, reason, error: reason };
  }
}
