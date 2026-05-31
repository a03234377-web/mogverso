import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function isValidAdminSecret(request: NextRequest): boolean {
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

function isValidCronSecret(request: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim() === expected;
  }

  const headerSecret = request.headers.get("x-cron-secret")?.trim();
  return headerSecret === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    if (!isValidAdminSecret(request)) {
      return withSecurityHeaders(
        NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
      );
    }
  }

  if (pathname.startsWith("/api/cron")) {
    if (!isValidCronSecret(request)) {
      return withSecurityHeaders(
        NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 }),
      );
    }
    if (request.method !== "GET") {
      return withSecurityHeaders(
        NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 }),
      );
    }
  }

  if (pathname.startsWith("/api/vote") || pathname.startsWith("/api/heal")) {
    if (request.method !== "POST") {
      return withSecurityHeaders(
        NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 }),
      );
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*"],
};
