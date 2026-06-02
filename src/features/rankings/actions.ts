"use server";

import {
  performEntryVote,
  performHealEntryVote,
  type ActionResult,
} from "@/lib/firebase/perform";
import {
  assertHealServerAction,
  assertVoteServerAction,
} from "@/lib/security/server-action-auth";

export async function submitEntryVote(
  candidateId: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const { deviceId: sanitized, ip } = await assertVoteServerAction(deviceId);
  return performEntryVote(candidateId, sanitized, ip, recaptchaToken);
}

export async function healEntryVoteAction(): Promise<ActionResult> {
  const ip = await assertHealServerAction();
  return performHealEntryVote(ip);
}
