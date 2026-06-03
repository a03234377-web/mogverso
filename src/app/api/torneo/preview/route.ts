import { requireAdminBackend } from "@/lib/api/route-helpers";
import {
  fetchTorneoSeedNames,
  previewOctavosPairings,
} from "@/lib/firebase/torneo-seed";
import { jsonError, jsonOk } from "@/lib/security/api-response";

/** Top 16 y emparejamientos de octavos (solo lectura, para el cuadro en espera). */
export async function GET() {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  try {
    const seedNames = await fetchTorneoSeedNames();
    return jsonOk({
      seedNames,
      pairings: previewOctavosPairings(seedNames),
    });
  } catch (err) {
    console.error("[api/torneo/preview]", err);
    return jsonError("preview_failed", 500);
  }
}
