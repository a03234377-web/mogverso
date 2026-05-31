"use server";

import { getServerClientIp } from "@/lib/api/server-ip";
import { sanitizeDeviceId } from "@/lib/api/route-helpers";
import {
  performEntryVote,
  performHealEntryVote,
  type ActionResult,
} from "@/lib/firebase/perform";

export async function submitEntryVote(
  candidateId: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performEntryVote(candidateId, sanitizeDeviceId(deviceId), ip, recaptchaToken);
}

export async function healEntryVoteAction(): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performHealEntryVote(ip);
}
