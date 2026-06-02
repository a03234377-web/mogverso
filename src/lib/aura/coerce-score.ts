import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import type { AuraScores } from "@/types/aura";

/**
 * Parsea enteros en strings legacy (HTML, formato español con miles: «3.900» → 3900).
 * En JS, Number("3.900") === 3.9; sin esto los votos parten de una base errónea.
 */
function parseNumericString(stripped: string): number {
  const compact = stripped.replace(/\s/g, "");
  if (compact === "") return 0;

  if (/^\d+$/.test(compact)) {
    return Math.trunc(Number(compact));
  }

  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) {
    return Math.trunc(Number(compact.replace(/\./g, "")));
  }

  if (/^\d{1,3}(,\d{3})+$/.test(compact)) {
    return Math.trunc(Number(compact.replace(/,/g, "")));
  }

  if (/^\d+,\d+$/.test(compact)) {
    return Math.trunc(Number(compact.replace(",", ".")));
  }

  const n = Number(compact);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/** Convierte puntuaciones RTDB a entero (strings legacy, HTML residual). */
export function coerceAuraScore(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const stripped = value.replace(/<[^>]*>/g, "").trim();
    return parseNumericString(stripped);
  }
  return 0;
}

/** Normaliza claves Firebase (alias «Tito» → «TitoChape») y fusiona duplicados. */
export function parseAuraScores(raw: unknown): AuraScores {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: AuraScores = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const canonical = resolveCanonicalRankerName(key);
    const score = coerceAuraScore(value);
    const prev = out[canonical];
    if (prev === undefined || score > prev) {
      out[canonical] = score;
    }
  }
  return out;
}

const AURA_SCORE_FORMATTER = new Intl.NumberFormat("es-ES", {
  useGrouping: false,
  maximumFractionDigits: 0,
});

/** Sin separador de miles (en es-ES, 3380 sería «3.380» y se confunde con 338). */
export function formatAuraScore(aura: number): string {
  return AURA_SCORE_FORMATTER.format(aura);
}
