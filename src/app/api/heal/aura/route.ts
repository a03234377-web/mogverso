import { guardHealRequest } from "@/lib/api/route-helpers";
import { performHealAura } from "@/lib/firebase/perform";
import { getClientIp } from "@/lib/security/client-ip";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const guard = await guardHealRequest();
  if (guard) return guard;

  try {
    await request.json().catch(() => ({}));
    const ip = getClientIp(request);
    const result = await performHealAura(ip);

    if (!result.ok) {
      return jsonError(result.reason ?? result.error ?? "heal_failed", 429, {
        reason: result.reason ?? result.error,
      });
    }

    return jsonOk({ healed: result.healed });
  } catch (err) {
    console.error("[api/heal/aura]", err);
    return jsonError("heal_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
