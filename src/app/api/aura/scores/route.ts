import { getAdminDatabase, isAdminConfigured } from "@/lib/firebase/admin";
import { parseAuraScores } from "@/lib/aura/coerce-score";
import { jsonError, jsonOk, serviceUnavailable } from "@/lib/security/api-response";

/** Puntuaciones mensuales de aura (lectura vía Admin SDK; fallback si el cliente RTDB no puede leer). */
export async function GET() {
  if (!isAdminConfigured()) return serviceUnavailable();

  try {
    const snap = await getAdminDatabase().ref("aura/scores").get();
    const scores = snap.exists() ? parseAuraScores(snap.val()) : {};
    return jsonOk({ scores });
  } catch (err) {
    console.error("[api/aura/scores]", err);
    return jsonError("scores_failed", 500);
  }
}
