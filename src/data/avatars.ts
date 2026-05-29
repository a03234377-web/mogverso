import { creatorImage } from "@/data/creator-images";

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

/** Emoji fallback cuando no hay foto */
export const FALLBACK: Record<string, string> = {
  Kappah: "👑",
  RubenMaxxing: "🔬",
  SergiCabrer: "🌊",
  Sergi: "🌊",
  JoseNogales: "🌿",
  TitoChape: "🍪",
  Aaronjaureguii: "⭐",
  AlejandroAle: "😄",
  JordiWild: "🎙️",
  Peldanyos: "🏗️",
  IbaiLlanos: "🎮",
  ChiquiIbai: "😂",
  Peereira7: "⚽",
  Franbeuve: "🎭",
  Franbv: "🎭",
  Febron: "💪",
  Elcalvo: "🧠",
  Didac: "🎯",
  Javichu: "⚡",
  Ismael: "🌟",
  AlvaroSapo: "🐸",
  Hectrollprox: "👾",
  Giva: "🔥",
  "Nil Ojeda": "💎",
};

export function getRankerFallback(name: string): string {
  if (!name) return "👤";
  const key = RANKER_PHOTO_ALIASES[name] ?? name;
  return FALLBACK[key] ?? FALLBACK[name] ?? "👤";
}
