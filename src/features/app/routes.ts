import type { PageId } from "@/features/app/types";

/** Rutas públicas de cada sección (App Router). */
export const LOOKSMAX_PATHS: Record<Exclude<PageId, "profile">, string> = {
  rankings: "/rankings",
  rankvote: "/rankvote",
  torneo: "/torneo",
  noticias: "/noticias",
  consejo: "/consejo",
};

export const DEFAULT_LOOKSMAX_PATH = LOOKSMAX_PATHS.rankings;

export function profilePath(index: number): string {
  return `/perfil/${index}`;
}

export function pathForPage(page: PageId, profileIndex?: number | null): string {
  if (page === "profile" && profileIndex != null && profileIndex >= 0) {
    return profilePath(profileIndex);
  }
  if (page === "profile") return DEFAULT_LOOKSMAX_PATH;
  return LOOKSMAX_PATHS[page];
}

/** Resuelve la sección activa desde el pathname de Next.js. */
export function pageIdFromPathname(pathname: string): {
  page: PageId;
  profileIndex: number | null;
} {
  const clean = pathname.replace(/\/$/, "") || "/";

  if (clean === "/" || clean === "/rankings") {
    return { page: "rankings", profileIndex: null };
  }

  const profileMatch = /^\/perfil\/(\d+)$/.exec(clean);
  if (profileMatch) {
    return { page: "profile", profileIndex: Number(profileMatch[1]) };
  }

  const entry = Object.entries(LOOKSMAX_PATHS).find(([, path]) => path === clean);
  if (entry) {
    return { page: entry[0] as PageId, profileIndex: null };
  }

  return { page: "rankings", profileIndex: null };
}

export function isNavPage(page: PageId): page is keyof typeof LOOKSMAX_PATHS {
  return page !== "profile";
}
