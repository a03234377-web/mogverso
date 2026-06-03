const SECRET_KEY = "torneo_admin_secret";

export function getStoredAdminSecret(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SECRET_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function setStoredAdminSecret(secret: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SECRET_KEY, secret.trim());
  } catch {
    /* ignore */
  }
}

async function adminFetch<T>(
  path: string,
  secret: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json()) as { ok?: boolean; error?: string } & T;
  if (!res.ok) {
    return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  }
  return { ok: true, data: data as T };
}

export function adminTorneoGetState(secret: string) {
  return adminFetch<{ state: unknown; phaseEndLabel?: string }>(
    "/api/admin/torneo/state",
    secret,
  );
}

export function adminTorneoPreviewSeed(secret: string) {
  return adminFetch<{
    seed: string[];
    pairings: { id: string; p1: string; p2: string }[];
  }>("/api/admin/torneo/preview-seed", secret);
}

export function adminTorneoPost(
  secret: string,
  path: string,
  body?: Record<string, unknown>,
) {
  return adminFetch<{ state?: unknown; healed?: boolean }>(path, secret, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}
