import { requireAdminBackend } from "@/lib/api/route-helpers";
import {
  fetchTorneoSeedNames,
  previewOctavosPairings,
} from "@/lib/firebase/torneo-seed";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function GET(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const seed = await fetchTorneoSeedNames();
    const pairings = previewOctavosPairings(seed);
    return jsonOk({ seed, pairings });
  } catch (err) {
    console.error("[api/admin/torneo/preview-seed]", err);
    return jsonError("preview_failed", 500);
  }
}
