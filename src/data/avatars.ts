import { creatorImage } from "@/data/creator-images";
import type { IconName } from "@/types/icons";

/** Rutas de foto por nombre de ranker (clave canónica en RANKERS). */
export const FOTOS: Record<string, string> = {
  Kappah: creatorImage("kappah.png"),
  RubenMaxxing: creatorImage("rubenmaxxing.jpg"),
  SergiCabrer: creatorImage("SergiCabrer.jpeg"),
  JoseNogales: creatorImage("josenogales.jpeg"),
  TitoChape: creatorImage("titochape.jpeg"),
  Aaronjaureguii: creatorImage("aaronjaureguii.jpg"),
  AlejandroAle: creatorImage("alejandroale.png"),
  JordiWild: creatorImage("jordiwild.jpg"),
  Peldanyos: creatorImage("peldanyos.jpg"),
  IbaiLlanos: creatorImage("ibaillanos.jpg"),
  ChiquiIbai: creatorImage("chiquiibai.jpg"),
  Peereira7: creatorImage("peereira7.jpg"),
  Franbeuve: creatorImage("franbeuve.jpeg"),
  Febron: creatorImage("febron.jpeg"),
  Elcalvo: creatorImage("elcalvo.jpg"),
  Didac: creatorImage("didac.png"),
  Javichu: creatorImage("javichu.jpeg"),
  Ismael: creatorImage("ismael.jpeg"),
  AlvaroSapo: creatorImage("alvaro.png"),
  Hectrollprox: creatorImage("hectroll.png"),
  Giva: creatorImage("giva.jpeg"),
  "Nil Ojeda": creatorImage("nilojeda.png"),
};

/** Nombres alternativos (torneo, votación, Firebase) → clave en FOTOS. */
const RANKER_PHOTO_ALIASES: Record<string, string> = {
  Sergi: "SergiCabrer",
  Franbv: "Franbeuve",
};

/** Resuelve la URL de foto de un creador por nombre visible. */
export function getRankerPhoto(name: string): string | undefined {
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
