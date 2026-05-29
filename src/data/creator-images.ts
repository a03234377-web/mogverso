import { publicAsset } from "@/lib/asset-path";

/** Archivos esperados en public/img/ (misma convención que la SPA original). */
export const CREATOR_IMAGE_FILES = [
  "kappah.png",
  "kappahsub.png",
  "rubenmaxxing.jpg",
  "SergiCabrer.jpeg",
  "josenogales.jpeg",
  "titochape.jpeg",
  "aaronjaureguii.jpg",
  "alejandroale.png",
  "jordiwild.jpg",
  "peldanyos.jpg",
  "ibaillanos.jpg",
  "chiquiibai.jpg",
  "peereira7.jpg",
  "franbeuve.jpeg",
  "febron.jpeg",
  "elcalvo.jpg",
  "didac.png",
  "javichu.jpeg",
  "ismael.jpeg",
  "alvaro.png",
  "hectroll.png",
  "giva.jpeg",
  "nilojeda.png",
] as const;

export function creatorImage(file: (typeof CREATOR_IMAGE_FILES)[number]): string {
  return publicAsset(`img/${file}`);
}
