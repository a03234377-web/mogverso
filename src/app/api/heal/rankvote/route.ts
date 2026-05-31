import { guardHealRequest, requireAdminBackend } from "@/lib/api/route-helpers";
import { performHealRankvote } from "@/lib/firebase/perform";
import { getClientIp } from "@/lib/security/client-ip";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const guard = await guardHealRequest();
  if (guard) return guard;

  try {
    await request.json().catch(() => ({}));
    const ip = getClientIp(request);
    const result = await performHealRankvote(ip);

    if (!result.ok) {
      return jsonError(result.reason ?? result.error ?? "heal_failed", 429, {
        reason: result.reason ?? result.error,
      });
    }

    return jsonOk({ healed: result.healed });
  } catch (err) {
    console.error("[api/heal/rankvote]", err);
    return jsonError("heal_failed", 500);
  }
}

export async function GET() {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;
  return jsonError("method_not_allowed", 405);
}
