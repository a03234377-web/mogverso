import type { PageId } from "@/features/app/types";
import { rankerProfileSlug } from "@/features/rankings/lib/profile-slug";

/** Rutas públicas de cada sección (App Router). */
export const LOOKSMAX_PATHS: Record<Exclude<PageId, "profile">, string> = {
  rankings: "/rankings",
  rankvote: "/votar-rank",
  torneo: "/torneo",
  noticias: "/noticias",
  aura: "/aura",
};

export const DEFAULT_LOOKSMAX_PATH = LOOKSMAX_PATHS.rankings;

export type NavPageId = Exclude<PageId, "profile">;

/** Valida el query `from` de URLs de perfil (/perfil/x?from=rankvote). */
export function parseProfileFrom(value: string | null | undefined): NavPageId | null {
  if (!value) return null;
  if (isNavPage(value as PageId)) return value as NavPageId;
  return null;
}

export function parseProfileTarget(value: string | null | undefined): string | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  if (!clean) return null;
  return /^[a-z0-9-]+$/.test(clean) ? clean : null;
}

export function profilePath(
  name: string,
  from?: NavPageId | null,
  target?: string | null,
): string {
  const base = `/perfil/${rankerProfileSlug(name)}`;
  const origin = from ? parseProfileFrom(from) : null;
  const returnTarget = parseProfileTarget(target);
  if (!origin && !returnTarget) return base;
  const params = new URLSearchParams();
  if (origin) params.set("from", origin);
  if (returnTarget) params.set("target", returnTarget);
  return `${base}?${params.toString()}`;
}

export function backPathFromProfile(
  from: NavPageId | null | undefined,
  target?: string | null,
): string {
  const origin = from ? parseProfileFrom(from) : null;
  const base = origin ? LOOKSMAX_PATHS[origin] : DEFAULT_LOOKSMAX_PATH;
  const returnTarget = parseProfileTarget(target);
  if (!returnTarget) return base;
  return `${base}?target=${returnTarget}`;
}

/** /aura con scroll y foco en la fila de votación del ranker. */
export function auraPathWithVoteTarget(name: string, targetId: string): string {
  const id = parseProfileTarget(targetId);
  if (!id) return LOOKSMAX_PATHS.aura;
  return `${LOOKSMAX_PATHS.aura}?target=${id}`;
}

export function pathForPage(page: PageId, profileName?: string | null): string {
  if (page === "profile" && profileName) {
    return profilePath(profileName);
  }
  if (page === "profile") return DEFAULT_LOOKSMAX_PATH;
  return LOOKSMAX_PATHS[page];
}

/** Resuelve la sección activa desde el pathname de Next.js. */
export function pageIdFromPathname(pathname: string): {
  page: PageId;
  profileSlug: string | null;
} {
  const clean = pathname.replace(/\/$/, "") || "/";

  if (clean === "/" || clean === "/rankings") {
    return { page: "rankings", profileSlug: null };
  }

  const profileMatch = /^\/perfil\/([^/]+)$/.exec(clean);
  if (profileMatch) {
    return { page: "profile", profileSlug: profileMatch[1] };
  }

  const entry = Object.entries(LOOKSMAX_PATHS).find(([, path]) => path === clean);
  if (entry) {
    return { page: entry[0] as PageId, profileSlug: null };
  }

  return { page: "rankings", profileSlug: null };
}

export function isNavPage(page: PageId): page is keyof typeof LOOKSMAX_PATHS {
  return page !== "profile";
}
