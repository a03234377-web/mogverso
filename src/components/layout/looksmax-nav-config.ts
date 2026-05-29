import type { PageId } from "@/features/app/types";
import type { IconName } from "@/types/icons";

export type NavTabId = Exclude<PageId, "profile">;

export const DESKTOP_TABS: {
  id: NavTabId;
  label: string;
  icon: IconName;
  badge?: string;
  badgeClass?: string;
}[] = [
  { id: "rankings", label: "Rankings", icon: "trophy" },
  { id: "rankvote", label: "Votar Rank", icon: "vote" },
  {
    id: "torneo",
    label: "Torneo",
    icon: "goal",
    badge: "LIVE",
    badgeClass: "tab-badge-new",
  },
  {
    id: "noticias",
    label: "Noticias",
    icon: "newspaper",
    badge: "HOT",
    badgeClass: "tab-badge",
  },
  { id: "consejo", label: "Consejos", icon: "book-open" },
  { id: "lexico", label: "Léxico", icon: "book-marked" },
];

export const BNAV: {
  id: NavTabId;
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

export function desktopSelectedIndex(page: PageId): number {
  const idx = DESKTOP_TABS.findIndex((t) => t.id === page);
  return idx >= 0 ? idx : 0;
}

export function bottomSelectedIndex(page: PageId): number {
  const idx = BNAV.findIndex((t) => t.id === page);
  return idx >= 0 ? idx : 0;
}

export function sectionTitle(page: PageId): string {
  if (page === "profile") return "Perfil";
  return DESKTOP_TABS.find((t) => t.id === page)?.label ?? "Rankings";
}
