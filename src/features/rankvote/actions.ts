"use server";

import {
  performHealRankvote,
  performRankvoteVote,
  type ActionResult,
} from "@/lib/firebase/perform";
import {
  assertHealServerAction,
  assertVoteServerAction,
} from "@/lib/security/server-action-auth";

export async function submitRankVote(
  name: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const { deviceId: sanitized, ip } = await assertVoteServerAction(deviceId);
  return performRankvoteVote(name, sanitized, ip, recaptchaToken);
}

export async function healRankvoteAction(): Promise<ActionResult> {
  const ip = await assertHealServerAction();
  return performHealRankvote(ip);
}
