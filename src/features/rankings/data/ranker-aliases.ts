/** Nombres alternativos (URL, torneo, votación, Firebase) → nombre canónico en RANKERS. */
export const RANKER_NAME_ALIASES: Record<string, string> = {
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

/** Nombre visible o legacy → nombre canónico del roster. */
export function resolveCanonicalRankerName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  if (RANKER_NAME_ALIASES[trimmed]) return RANKER_NAME_ALIASES[trimmed];

  const alias = Object.entries(RANKER_NAME_ALIASES).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  return alias?.[1] ?? trimmed;
}
