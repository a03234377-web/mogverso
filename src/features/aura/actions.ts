"use server";

import { getServerClientIp } from "@/lib/api/server-ip";
import { sanitizeDeviceId } from "@/lib/api/route-helpers";
import {
  performAuraVote,
  performHealAura,
  type ActionResult,
} from "@/lib/firebase/perform";
import type { AuraVoteKind } from "@/types/aura";

export async function submitAuraVote(
  name: string,
  kind: AuraVoteKind,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult & { votesRemaining?: number; aura?: number }> {
  const ip = await getServerClientIp();
  return performAuraVote(name, kind, sanitizeDeviceId(deviceId), ip, recaptchaToken);
}

export async function healAuraAction(): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performHealAura(ip);
}
