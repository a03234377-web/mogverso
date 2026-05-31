"use server";

import { getServerClientIp } from "@/lib/api/server-ip";
import { sanitizeDeviceId } from "@/lib/api/route-helpers";
import {
  performHealTorneo,
  performTorneoVote,
  type ActionResult,
} from "@/lib/firebase/perform";

export async function submitTorneoVote(
  matchId: string,
  candidateName: string,
  deviceId: string,
  recaptchaToken?: string,
): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performTorneoVote(
    matchId,
    candidateName,
    sanitizeDeviceId(deviceId),
    ip,
    recaptchaToken,
  );
}

export async function healTorneoAction(options?: {
  restartIfEnded?: boolean;
}): Promise<ActionResult> {
  const ip = await getServerClientIp();
  return performHealTorneo(ip, options);
}
