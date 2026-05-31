/** Archivos que no siguen la regla `toLowerCase()` + espacios → `-`. */
const RANKER_PHOTO_FILE_OVERRIDES: Record<string, string> = {
  foxterGG: "foxter-gg.webp",
};

/** Nombre de ranker → archivo en `src/assets/creators/` (minúsculas, espacios → `-`). */
export function rankerPhotoFile(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return ".webp";

  const override = RANKER_PHOTO_FILE_OVERRIDES[trimmed];
  if (override) return override;

  const byCase = Object.entries(RANKER_PHOTO_FILE_OVERRIDES).find(
    ([key]) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byCase) return byCase[1];

  return `${trimmed.toLowerCase().replace(/\s+/g, "-")}.webp`;
}
