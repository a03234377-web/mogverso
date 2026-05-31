import {
  creatorImage,
  isCreatorImageFile,
  rankerPhotoFile,
  type CreatorPhoto,
} from "@/assets/creators";
import type { IconName } from "@/types/icons";
import { resolveCanonicalRankerName } from "./ranker-aliases";

function photoForRankerName(name: string): CreatorPhoto | undefined {
  const file = rankerPhotoFile(name);
  if (!isCreatorImageFile(file)) return undefined;
  return creatorImage(file);
}

/** Resuelve la foto de un creador por nombre visible. */
export function getRankerPhoto(name: string): CreatorPhoto | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;

  const canonical = resolveCanonicalRankerName(trimmed);
  return photoForRankerName(canonical);
}

/** Icono Lucide fallback cuando no hay foto */
const FALLBACK: Record<string, IconName> = {
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
  foxterGG: "laugh",
};

export function getRankerFallback(name: string): IconName {
  if (!name) return "user";
  const trimmed = name.trim();
  const aliasKey = resolveCanonicalRankerName(trimmed);
  return (
    FALLBACK[aliasKey] ??
    FALLBACK[trimmed] ??
    FALLBACK[
      Object.keys(FALLBACK).find((k) => k.toLowerCase() === trimmed.toLowerCase()) ?? ""
    ] ??
    "user"
  );
}
