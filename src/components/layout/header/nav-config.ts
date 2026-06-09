import type { PageId } from "@/features/app/types";
import type { IconName } from "@/types/icons";

export type HeaderNavTabId = Exclude<PageId, "profile">;

export const DESKTOP_TABS: {
  id: HeaderNavTabId;
  label: string;
  icon: IconName;
  badge?: string;
  badgeClass?: string;
}[] = [
  { id: "rankings", label: "Rankings", icon: "trophy" },
  { id: "aura", label: "Aura", icon: "sparkles" },
  { id: "rankvote", label: "Votar Rank", icon: "vote" },
  { id: "torneo", label: "Torneo", icon: "goal" },
  {
    id: "noticias",
    label: "Noticias",
    icon: "newspaper",
    badge: "HOT",
    badgeClass: "tab-badge",
  },
];

export function sectionTitle(page: PageId): string {
  if (page === "profile") return "Perfil";
  return DESKTOP_TABS.find((t) => t.id === page)?.label ?? "Rankings";
}
