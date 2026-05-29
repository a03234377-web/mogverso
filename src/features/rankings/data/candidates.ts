import { creatorImage } from "@/assets/creators";
import type { CreatorPhoto } from "@/assets/creators";
import type { IconName } from "@/types/icons";

export type EntryCandidate = {
  id: string;
  name: string;
  sub: string;
  icon: IconName;
  photo: CreatorPhoto;
};

export const CANDIDATES: EntryCandidate[] = [
  {
    id: "franbv",
    name: "Franbv",
    sub: "Creador · España",
    icon: "drama",
    photo: creatorImage("franbeuve.webp"),
  },
  {
    id: "nilojeda",
    name: "Nil Ojeda",
    sub: "Creador · España",
    icon: "gem",
    photo: creatorImage("nilojeda.webp"),
  },
];
