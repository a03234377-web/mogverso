import { creatorImage } from "@/assets/creators";
import type { CreatorPhoto } from "@/assets/creators";
import type { IconName } from "@/types/icons";

/** Rutas de foto por nombre de ranker (clave canónica en RANKERS). */
export const FOTOS: Record<string, CreatorPhoto> = {
  Kappah: creatorImage("kappah.webp"),
  RubenMaxxing: creatorImage("rubenmaxxing.webp"),
  SergiCabrer: creatorImage("SergiCabrer.webp"),
  JoseNogales: creatorImage("josenogales.webp"),
  TitoChape: creatorImage("titochape.webp"),
  Aaronjaureguii: creatorImage("aaronjaureguii.webp"),
  AlejandroAle: creatorImage("alejandroale.webp"),
  JordiWild: creatorImage("jordiwild.webp"),
  Peldanyos: creatorImage("peldanyos.webp"),
  IbaiLlanos: creatorImage("ibaillanos.webp"),
  ChiquiIbai: creatorImage("chiquiibai.webp"),
  Peereira7: creatorImage("peereira7.webp"),
  Franbeuve: creatorImage("franbeuve.webp"),
  Febron: creatorImage("febron.webp"),
  Elcalvo: creatorImage("elcalvo.webp"),
  Didac: creatorImage("didac.webp"),
  Javichu: creatorImage("javichu.webp"),
  Ismael: creatorImage("ismael.webp"),
  AlvaroSapo: creatorImage("alvaro.webp"),
  Hectrollprox: creatorImage("hectroll.webp"),
  Giva: creatorImage("giva.webp"),
  "Nil Ojeda": creatorImage("nilojeda.webp"),
};

/** Nombres alternativos (torneo, votación, Firebase) → clave en FOTOS. */
const RANKER_PHOTO_ALIASES: Record<string, string> = {
  Sergi: "SergiCabrer",
  Franbv: "Franbeuve",
};

/** Resuelve la foto de un creador por nombre visible. */
export function getRankerPhoto(name: string): CreatorPhoto | undefined {
  if (!name) return undefined;
  const key = RANKER_PHOTO_ALIASES[name] ?? name;
  return FOTOS[key];
}

/** Icono Lucide fallback cuando no hay foto */
export const FALLBACK: Record<string, IconName> = {
  Kappah: "crown",
  RubenMaxxing: "microscope",
  SergiCabrer: "waves",
  Sergi: "waves",
  JoseNogales: "leaf",
  TitoChape: "cookie",
  Aaronjaureguii: "star",
  AlejandroAle: "smile",
  JordiWild: "mic",
  Peldanyos: "building-2",
  IbaiLlanos: "gamepad-2",
  ChiquiIbai: "laugh",
  Peereira7: "goal",
  Franbeuve: "drama",
  Franbv: "drama",
  Febron: "dumbbell",
  Elcalvo: "brain",
  Didac: "target",
  Javichu: "zap",
  Ismael: "sparkles",
  AlvaroSapo: "turtle",
  Hectrollprox: "ghost",
  Giva: "flame",
  "Nil Ojeda": "gem",
};

export function getRankerFallback(name: string): IconName {
  if (!name) return "user";
  const key = RANKER_PHOTO_ALIASES[name] ?? name;
  return FALLBACK[key] ?? FALLBACK[name] ?? "user";
}
