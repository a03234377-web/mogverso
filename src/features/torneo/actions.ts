"use server";

import {
  performHealTorneo,
  performTorneoVote,
  type ActionResult,
} from "@/lib/firebase/perform";
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
