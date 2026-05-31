import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";

/** Segmento URL para /perfil/[slug] (codifica espacios y caracteres especiales). */
export function rankerProfileSlug(name: string): string {
  return encodeURIComponent(name.trim());
}

export function findRankerByProfileSlug(
  slug: string,
  rankers: Ranker[] = RANKERS,
): Ranker | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return undefined;
  }

  const exact = rankers.find((r) => r.name === decoded);
  if (exact) return exact;

  const lower = decoded.toLowerCase();
  return rankers.find((r) => r.name.toLowerCase() === lower);
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
