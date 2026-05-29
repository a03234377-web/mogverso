import { publicAsset } from "@/lib/asset-path";

/** Archivos esperados en public/img/ (WebP). */
export const CREATOR_IMAGE_FILES = [
  "kappah.webp",
  "kappahsub.webp",
  "rubenmaxxing.webp",
  "SergiCabrer.webp",
  "josenogales.webp",
  "titochape.webp",
  "aaronjaureguii.webp",
  "alejandroale.webp",
  "jordiwild.webp",
  "peldanyos.webp",
  "ibaillanos.webp",
  "chiquiibai.webp",
  "peereira7.webp",
  "franbeuve.webp",
  "febron.webp",
  "elcalvo.webp",
  "didac.webp",
  "javichu.webp",
  "ismael.webp",
  "alvaro.webp",
  "hectroll.webp",
  "giva.webp",
  "nilojeda.webp",
] as const;

export function creatorImage(file: (typeof CREATOR_IMAGE_FILES)[number]): string {
  return publicAsset(`img/${file}`);
}
