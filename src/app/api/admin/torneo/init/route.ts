import { requireAdminBackend } from "@/lib/api/route-helpers";
import { adminInitTorneo } from "@/lib/firebase/server-torneo";
import { isValidAdminSecret } from "@/lib/security/admin-auth";
import { jsonError, jsonOk } from "@/lib/security/api-response";

export async function POST(request: Request) {
  const unavailable = await requireAdminBackend();
  if (unavailable) return unavailable;

  if (!isValidAdminSecret(request)) {
    return jsonError("unauthorized", 401);
  }

  try {
    const body = (await request.json()) as { state?: Record<string, unknown> };
    if (!body.state || typeof body.state !== "object") {
      return jsonError("missing_state", 400);
    }
    await adminInitTorneo(body.state);
    return jsonOk({ state: body.state });
  } catch (err) {
    console.error("[api/admin/torneo/init]", err);
    return jsonError("init_failed", 500);
  }
}

export async function GET() {
  return jsonError("method_not_allowed", 405);
}
