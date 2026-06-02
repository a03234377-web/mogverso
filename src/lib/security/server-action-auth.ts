import {
  guardHealRequest,
  guardVoteRequest,
  sanitizeDeviceId,
} from "@/lib/api/route-helpers";
import { getServerClientIp } from "@/lib/api/server-ip";

function guardErrorMessage(): string {
  return "server_not_configured";
}

/** Device-bound vote actions (no session): Admin SDK + device id + rate limit in perform. */
export async function assertVoteServerAction(deviceId: string): Promise<{
  deviceId: string;
  ip: string;
}> {
  const guard = await guardVoteRequest();
  if (guard) throw new Error(guardErrorMessage());

  const sanitized = sanitizeDeviceId(deviceId);
  if (!sanitized) throw new Error("unauthorized");

  const ip = await getServerClientIp();
  return { deviceId: sanitized, ip };
}

/** Heal/cron-style server actions: Admin SDK must be configured. */
export async function assertHealServerAction(): Promise<string> {
  const guard = await guardHealRequest();
  if (guard) throw new Error(guardErrorMessage());
  return getServerClientIp();
}
