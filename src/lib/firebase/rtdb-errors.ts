export function isRtdbPermissionDenied(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code: string }).code) : "";
  const message = "message" in err ? String((err as { message: string }).message) : "";
  return /permission_denied/i.test(code) || /permission_denied/i.test(message);
}
