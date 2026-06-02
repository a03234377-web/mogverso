"use server";

import { performAuraVote, type ActionResult } from "@/lib/firebase/perform";
import { assertVoteServerAction } from "@/lib/security/server-action-auth";
import type { AuraVoteKind } from "@/types/aura";

export async function submitAuraVote(
  name: string,
  kind: AuraVoteKind,
  deviceId: string,
  recaptchaToken?: string,
): Promise<
  ActionResult & {
    votesRemaining?: number;
    aura?: number;
    delta?: number;
    weekId?: string;
    votedNames?: string[];
  }
> {
  const { deviceId: sanitized, ip } = await assertVoteServerAction(deviceId);
  return performAuraVote(name, kind, sanitized, ip, recaptchaToken);
}
