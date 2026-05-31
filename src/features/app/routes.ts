import type { PageId } from "@/features/app/types";
import { rankerProfileSlug } from "@/features/rankings/lib/profile-slug";

/** Rutas públicas de cada sección (App Router). */
export const LOOKSMAX_PATHS: Record<Exclude<PageId, "profile">, string> = {
  rankings: "/rankings",
  rankvote: "/rankvote",
  torneo: "/torneo",
  noticias: "/noticias",
  consejo: "/consejo",
};

export const DEFAULT_LOOKSMAX_PATH = LOOKSMAX_PATHS.rankings;

export function profilePath(name: string): string {
  return `/perfil/${rankerProfileSlug(name)}`;
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
