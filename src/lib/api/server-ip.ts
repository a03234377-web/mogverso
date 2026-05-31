import { headers } from "next/headers";
import { hashIpForVote } from "@/lib/security/client-ip";

export async function getServerClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function getServerIpHash(): Promise<string> {
  return hashIpForVote(await getServerClientIp());
}
