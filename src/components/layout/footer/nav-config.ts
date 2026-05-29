import type { PageId } from "@/features/app/types";
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
  { id: "rankvote", label: "Votar", icon: "vote", tabIdx: 1 },
  { id: "torneo", label: "Torneo", icon: "goal", badge: "LIVE", tabIdx: 2 },
  { id: "noticias", label: "Noticias", icon: "newspaper", badge: "HOT", tabIdx: 3 },
];

export function bottomSelectedIndex(page: PageId): number {
  const idx = BNAV.findIndex((t) => t.id === page);
  return idx >= 0 ? idx : 0;
}
