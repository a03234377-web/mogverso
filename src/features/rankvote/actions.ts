"use server";

import { getServerClientIp } from "@/lib/api/server-ip";
import { sanitizeDeviceId } from "@/lib/api/route-helpers";
import {
  performHealRankvote,
  performRankvoteVote,
  type ActionResult,
} from "@/lib/firebase/perform";

export async function submitRankVote(
  name: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performRankvoteVote(name, sanitizeDeviceId(deviceId), ip, recaptchaToken);
}

export async function healRankvoteAction(): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performHealRankvote(ip);
}
