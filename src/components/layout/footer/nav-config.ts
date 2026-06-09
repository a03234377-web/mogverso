import type { IconName } from "@/types/icons";
import type { HeaderNavTabId } from "@/components/layout/header/nav-config";

export const BNAV: {
  id: HeaderNavTabId;
  label: string;
  icon: IconName;
  badge?: string;
  tabIdx: number;
}[] = [
  { id: "rankings", label: "Rankings", icon: "trophy", tabIdx: 0 },
  { id: "aura", label: "Aura", icon: "sparkles", tabIdx: 1 },
  { id: "rankvote", label: "Votar", icon: "vote", tabIdx: 2 },
  { id: "torneo", label: "Torneo", icon: "goal", tabIdx: 3 },
  { id: "noticias", label: "Noticias", icon: "newspaper", badge: "HOT", tabIdx: 4 },
];
