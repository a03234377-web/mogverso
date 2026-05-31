import { rankerPhotoFile } from "@/assets/creators";
import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";

/** Segmento URL para /perfil/[slug] (codifica espacios y caracteres especiales). */
export function rankerProfileSlug(name: string): string {
  return encodeURIComponent(name.trim());
}

/** Valor del param `[slug]` en rutas estáticas (sin codificar; Next codifica la URL). */
export function rankerProfileParam(name: string): string {
  return name.trim();
}

function normalizeProfileSlug(slug: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug.trim());
  } catch {
    return slug.trim();
  }
  return decoded;
}

function resolveRankerNameFromSlug(name: string, rankers: Ranker[]): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const canonical = resolveCanonicalRankerName(trimmed);
  if (rankers.some((r) => r.name === canonical)) return canonical;

  const lower = canonical.toLowerCase();
  const byName = rankers.find((r) => r.name.toLowerCase() === lower);
  return byName?.name ?? canonical;
}

function findRankerByKebabSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  const kebab = slug.trim().toLowerCase();
  if (!kebab.includes("-")) return undefined;
  return rankers.find((r) => rankerPhotoFile(r.name).replace(/\.webp$/, "") === kebab);
}

function findRankerByProfileSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  const normalized = normalizeProfileSlug(slug);
  const canonical = resolveRankerNameFromSlug(normalized, rankers);

  const exact = rankers.find((r) => r.name === canonical);
  if (exact) return exact;

  const lower = canonical.toLowerCase();
  const byCase = rankers.find((r) => r.name.toLowerCase() === lower);
  if (byCase) return byCase;

  return findRankerByKebabSlug(normalized, rankers);
}

/** Compatibilidad con URLs legacy /perfil/0, /perfil/1, … */
export function findRankerByLegacyIndex(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  if (!/^\d+$/.test(slug)) return undefined;
  const i = Number(slug);
  if (!Number.isInteger(i) || i < 0 || i >= rankers.length) return undefined;
  return rankers[i];
}

export function resolveRankerFromProfileSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  return (
    findRankerByProfileSlug(slug, rankers) ?? findRankerByLegacyIndex(slug, rankers)
  );
}
