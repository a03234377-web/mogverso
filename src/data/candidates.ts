import { creatorImage } from "@/data/creator-images";
import type { IconName } from "@/types/icons";

export type EntryCandidate = {
  id: string;
  name: string;
  sub: string;
  icon: IconName;
  photo: string;
};

export const CANDIDATES: EntryCandidate[] = [
  {
    id: "franbv",
    name: "Franbv",
    sub: "Creador · España",
    icon: "drama",
    photo: creatorImage("franbeuve.jpeg"),
  },
  {
    id: "nilojeda",
    name: "Nil Ojeda",
    sub: "Creador · España",
    icon: "gem",
    photo: creatorImage("nilojeda.png"),
  },
];
