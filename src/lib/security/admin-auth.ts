export function isValidAdminSecret(request: Request): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) return false;

  const headerSecret = request.headers.get("x-admin-secret")?.trim();
  if (headerSecret && headerSecret === expected) return true;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim() === expected;
  }

  return false;
}
