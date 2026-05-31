import { requireAdminBackend } from "@/lib/api/route-helpers";
import { performCronHealTorneo } from "@/lib/firebase/perform";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function GET() {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  try {
    const result = await performCronHealTorneo();
    if (!result.ok) {
      return jsonError(result.error ?? result.reason ?? "heal_failed", 500);
    }
    return jsonOk({ healed: result.healed });
  } catch (err) {
    console.error("[api/cron/torneo-advance]", err);
    return jsonError("heal_failed", 500);
  }
}

export async function POST() {
  return jsonError("method_not_allowed", 405);
}
