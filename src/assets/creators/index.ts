import type { StaticImageData } from "next/image";

import aaronjaureguii from "./aaronjaureguii.webp";
import alejandroale from "./alejandroale.webp";
import alvaro from "./alvaro.webp";
import chiquiibai from "./chiquiibai.webp";
import didac from "./didac.webp";
import elcalvo from "./elcalvo.webp";
import febron from "./febron.webp";
import franbeuve from "./franbeuve.webp";
import giva from "./giva.webp";
import hectroll from "./hectroll.webp";
import ibaillanos from "./ibaillanos.webp";
import ismael from "./ismael.webp";
import javichu from "./javichu.webp";
import jordiwild from "./jordiwild.webp";
import josenogales from "./josenogales.webp";
import kappah from "./kappah.webp";
import kappahsub from "./kappahsub.webp";
import nilojeda from "./nilojeda.webp";
import peereira7 from "./peereira7.webp";
import peldanyos from "./peldanyos.webp";
import rubenmaxxing from "./rubenmaxxing.webp";
import sergiCabrer from "./SergiCabrer.webp";
import titochape from "./titochape.webp";

/** Archivos de creadores importados (optimizados por Next.js). */
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

export type CreatorImageFile = (typeof CREATOR_IMAGE_FILES)[number];

const CREATOR_IMAGES: Record<CreatorImageFile, StaticImageData> = {
  "kappah.webp": kappah,
  "kappahsub.webp": kappahsub,
  "rubenmaxxing.webp": rubenmaxxing,
  "SergiCabrer.webp": sergiCabrer,
  "josenogales.webp": josenogales,
  "titochape.webp": titochape,
  "aaronjaureguii.webp": aaronjaureguii,
  "alejandroale.webp": alejandroale,
  "jordiwild.webp": jordiwild,
  "peldanyos.webp": peldanyos,
  "ibaillanos.webp": ibaillanos,
  "chiquiibai.webp": chiquiibai,
  "peereira7.webp": peereira7,
  "franbeuve.webp": franbeuve,
  "febron.webp": febron,
  "elcalvo.webp": elcalvo,
  "didac.webp": didac,
  "javichu.webp": javichu,
  "ismael.webp": ismael,
  "alvaro.webp": alvaro,
  "hectroll.webp": hectroll,
  "giva.webp": giva,
  "nilojeda.webp": nilojeda,
};

export type CreatorPhoto = StaticImageData;

export function creatorImage(file: CreatorImageFile): CreatorPhoto {
  return CREATOR_IMAGES[file];
}

export function isCreatorImageFile(name: string): name is CreatorImageFile {
  return name in CREATOR_IMAGES;
}
