import { requireAdminBackend } from "@/lib/api/route-helpers";
import { clearTorneoVotes } from "@/lib/firebase/server-torneo";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    await clearTorneoVotes();
    return jsonOk({ cleared: true });
  } catch (err) {
    console.error("[api/admin/torneo/clear-votes]", err);
    return jsonError("clear_failed", 500);
  }
}
