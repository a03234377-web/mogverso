import { creatorImage } from "@/data/creator-images";

export type EntryCandidate = {
  id: string;
  name: string;
  sub: string;
  emoji: string;
  photo: string;
};

export const CANDIDATES: EntryCandidate[] = [
  {
    id: "franbv",
    name: "Franbv",
    sub: "Creador · España",
    emoji: "🎭",
    photo: creatorImage("franbeuve.jpeg"),
  },
  {
    id: "nilojeda",
    name: "Nil Ojeda",
    sub: "Creador · España",
    emoji: "💎",
    photo: creatorImage("nilojeda.png"),
  },
];
