export function isValidCronSecret(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim() === expected;
  }

  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  return headerSecret === expected;
}
