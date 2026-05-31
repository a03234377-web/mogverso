import { rankerPhotoFile } from "@/assets/creators";
import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";

/** Segmento URL para /perfil/[slug] (codifica espacios y caracteres especiales). */
export function rankerProfileSlug(name: string): string {
  return encodeURIComponent(name.trim());
}

/** Valor del param `[slug]` en rutas estáticas (sin codificar; Next codifica la URL). */
export function rankerProfileParam(name: string): string {
  return name.trim();
}

/** Alias de URL o nombre legacy → nombre canónico en RANKERS. */
const PROFILE_SLUG_ALIASES: Record<string, string> = {
  Sergi: "SergiCabrer",
  Franbv: "Franbeuve",
  NilOjeda: "Nil Ojeda",
  Ibai: "IbaiLlanos",
  Chiqui: "ChiquiIbai",
  Tito: "TitoChape",
  Alvaro: "AlvaroSapo",
  Hectroll: "Hectrollprox",
  Ruben: "RubenMaxxing",
};

function normalizeProfileSlug(slug: string): string {
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug.trim());
  } catch {
    return slug.trim();
  }
  return decoded;
}

function resolveCanonicalRankerName(name: string, rankers: Ranker[]): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  if (PROFILE_SLUG_ALIASES[trimmed]) return PROFILE_SLUG_ALIASES[trimmed];

  const alias = Object.entries(PROFILE_SLUG_ALIASES).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (alias) return alias[1];

  if (rankers.some((r) => r.name === trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  const byName = rankers.find((r) => r.name.toLowerCase() === lower);
  return byName?.name ?? trimmed;
}

function findRankerByKebabSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  const kebab = slug.trim().toLowerCase();
  if (!kebab.includes("-")) return undefined;
  return rankers.find((r) => rankerPhotoFile(r.name).replace(/\.webp$/, "") === kebab);
}

export function findRankerByProfileSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  const normalized = normalizeProfileSlug(slug);
  const canonical = resolveCanonicalRankerName(normalized, rankers);

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
