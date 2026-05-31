export async function verifyRecaptchaToken(
  token: string | undefined,
  remoteIp: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      return { ok: true };
    }
    return { ok: false, reason: "recaptcha_not_configured" };
  }

  if (!token?.trim()) {
    return { ok: false, reason: "missing_recaptcha" };
  }

  const params = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp,
  });

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return { ok: false, reason: "recaptcha_verify_failed" };
  }

  const data = (await res.json()) as {
    success?: boolean;
    score?: number;
    action?: string;
  };

  if (!data.success) {
    return { ok: false, reason: "recaptcha_invalid" };
  }

  if (typeof data.score === "number" && data.score < 0.5) {
    return { ok: false, reason: "recaptcha_low_score" };
  }

  return { ok: true };
}
