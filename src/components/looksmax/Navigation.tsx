"use client";

import { useEffect, useRef } from "react";
import { Keys } from "@/lib/a11y/keyboard";
import { Icon } from "@/components/icons";
import type { NavigationProps, PageId } from "@/components/looksmax/types";
import { PAGE_PANEL_IDS } from "@/lib/a11y/page-panels";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRovingTabIndex } from "@/hooks/useRovingTabIndex";
import type { IconName } from "@/types/icons";

const DESKTOP_TABS: {
  id: PageId;
  label: string;
  icon: IconName;
  badge?: string;
  badgeClass?: string;
}[] = [
  { id: "rankings", label: "Rankings", icon: "trophy" },
  { id: "rankvote", label: "Votar Rank", icon: "vote" },
  { id: "torneo", label: "Torneo", icon: "goal", badge: "LIVE", badgeClass: "tab-badge-new" },
  { id: "noticias", label: "Noticias", icon: "newspaper", badge: "HOT", badgeClass: "tab-badge" },
  { id: "consejo", label: "Consejos", icon: "book-open" },
  { id: "lexico", label: "Léxico", icon: "book-marked" },
];

const BNAV: { id: PageId; label: string; icon: IconName; badge?: string; tabIdx: number }[] = [
  { id: "rankings", label: "Rankings", icon: "trophy", tabIdx: 0 },
  { id: "rankvote", label: "Votar", icon: "vote", tabIdx: 1 },
  { id: "torneo", label: "Torneo", icon: "goal", badge: "LIVE", tabIdx: 2 },
  { id: "noticias", label: "Noticias", icon: "newspaper", badge: "HOT", tabIdx: 3 },
];

type NavProps = NavigationProps & {
  moreOpen: boolean;
  onToggleMore: () => void;
};

function desktopSelectedIndex(page: PageId): number {
  const idx = DESKTOP_TABS.findIndex((t) => t.id === page);
  return idx >= 0 ? idx : 0;
}

function bottomSelectedIndex(page: PageId): number {
  const idx = BNAV.findIndex((t) => t.id === page);
  return idx >= 0 ? idx : 0;
}

function isRovingKey(key: string): boolean {
  return (
    key === Keys.ArrowLeft ||
    key === Keys.ArrowRight ||
    key === Keys.Home ||
    key === Keys.End
  );
}

export function DesktopNav({ page, onNavigate, onOpenDiscord }: NavigationProps) {
  const selectedIndex = desktopSelectedIndex(page);
  const keyboardRoving = useRef(false);
  const { focusedIndex, getTabIndex, onKeyDown, syncFocusedIndex } = useRovingTabIndex({
    count: DESKTOP_TABS.length,
    selectedIndex,
    orientation: "horizontal",
  });

  useEffect(() => {
    syncFocusedIndex(selectedIndex);
  }, [page, selectedIndex, syncFocusedIndex]);

  useEffect(() => {
    if (!keyboardRoving.current) return;
    keyboardRoving.current = false;
    const tab = DESKTOP_TABS[focusedIndex];
    if (!tab) return;
    document.getElementById(`tab-desktop-${tab.id}`)?.focus();
  }, [focusedIndex]);

  const onTabListKeyDown = (e: React.KeyboardEvent) => {
    if (isRovingKey(e.key)) keyboardRoving.current = true;
    onKeyDown(e);
  };

  return (
    <nav
      className="sticky top-0 z-[100] flex h-[var(--lm-nav-height)] items-center justify-between gap-2 border-b border-lm-border bg-[rgba(7,9,15,0.96)] px-5 backdrop-blur-2xl max-md:px-4"
      aria-label="Navegación principal"
    >
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="flex h-9 w-9 shrink-0 animate-logo-pulse items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] text-black shadow-[0_0_16px_rgba(232,184,75,0.3)] select-none max-md:h-8 max-md:w-8 max-md:rounded-lg"
          aria-hidden
        >
          <Icon name="crown" size={20} />
        </div>
        <div className="font-display w-fit bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold2))] bg-clip-text text-[1.2rem] tracking-[2px] text-transparent whitespace-nowrap max-md:text-base max-md:tracking-wide">
          LooksMax<span className="text-lm-gold">ES</span>
          <span className="block font-sans text-[0.55rem] font-semibold tracking-[2px] text-lm-text2 max-[360px]:hidden">
            España · Ranking
          </span>
        </div>
      </div>
      <div
        className="hidden items-center gap-0 overflow-x-auto scrollbar-none md:flex"
        id="desktopTabs"
        role="tablist"
        aria-label="Secciones"
        onKeyDown={onTabListKeyDown}
      >
        {DESKTOP_TABS.map((tab, idx) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-desktop-${tab.id}`}
            aria-controls={PAGE_PANEL_IDS[tab.id]}
            aria-selected={page === tab.id}
            tabIndex={getTabIndex(idx)}
            className={cn(
              "lm-focus-ring flex h-[var(--lm-nav-height)] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 bg-transparent px-3 font-sans text-[0.7rem] font-bold uppercase tracking-[0.8px] text-lm-text2 transition-all duration-250 select-none hover:text-lm-text",
              page === tab.id && "border-b-2 border-lm-gold text-lm-gold",
            )}
            onClick={() => {
              syncFocusedIndex(idx);
              onNavigate(tab.id, idx);
            }}
          >
            <Icon
              name={tab.icon}
              size={14}
              className={page === tab.id ? "text-lm-gold" : undefined}
            />
            {tab.label}
            {tab.badge && (
              <span
                className={cn(
                  "rounded-full px-1 py-0.5 text-[0.5rem] font-black text-white animate-pulse-soft",
                  tab.badgeClass === "tab-badge-new"
                    ? "bg-lm-orange text-[0.48rem] px-1"
                    : "bg-lm-red2",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="lm-focus-ring-on-gold flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] px-3.5 py-2 font-sans text-[0.7rem] font-extrabold uppercase tracking-[0.8px] text-black transition-all duration-200 select-none hover:scale-[1.04] max-md:min-h-9 max-md:px-3 max-md:py-1.5 max-md:text-[0.68rem]"
          onClick={onOpenDiscord}
        >
          <Icon name="star" size={14} className="text-black" />
          Unirse
        </button>
      </div>
    </nav>
  );
}

export function BottomNav({
  page,
  onNavigate,
  onOpenDiscord,
  moreOpen,
  onToggleMore,
}: NavProps) {
  const moreActive = page === "consejo" || page === "lexico";
  const selectedIndex = bottomSelectedIndex(page);
  const keyboardRoving = useRef(false);

  const { focusedIndex, getTabIndex, onKeyDown, syncFocusedIndex } = useRovingTabIndex({
    count: BNAV.length,
    selectedIndex,
    orientation: "horizontal",
  });

  useEffect(() => {
    syncFocusedIndex(selectedIndex);
  }, [page, selectedIndex, syncFocusedIndex]);

  useEffect(() => {
    if (!keyboardRoving.current) return;
    keyboardRoving.current = false;
    const tab = BNAV[focusedIndex];
    if (!tab) return;
    document.getElementById(`tab-bnav-${tab.id}`)?.focus();
  }, [focusedIndex]);

  const onTabListKeyDown = (e: React.KeyboardEvent) => {
    if (isRovingKey(e.key)) keyboardRoving.current = true;
    onKeyDown(e);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] hidden h-[var(--lm-bottom-nav-height)] items-center justify-around border-t border-lm-border bg-[rgba(7,9,15,0.98)] px-2 backdrop-blur-2xl max-md:flex"
        id="bottomNav"
        aria-label="Navegación móvil"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          className="flex h-full flex-1 items-center justify-around"
          role="tablist"
          aria-label="Secciones"
          onKeyDown={onTabListKeyDown}
        >
          {BNAV.map((tab, idx) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-bnav-${tab.id}`}
              aria-controls={PAGE_PANEL_IDS[tab.id]}
              aria-selected={page === tab.id}
              tabIndex={getTabIndex(idx)}
              className={cn(
                "lm-focus-ring relative flex h-full flex-1 flex-col items-center justify-center gap-1 border-0 border-t-2 border-transparent bg-transparent px-0.5 py-1 font-sans transition-all duration-200",
                page === tab.id && "border-t-lm-gold",
              )}
              onClick={() => {
                syncFocusedIndex(idx);
                onNavigate(tab.id, tab.tabIdx);
              }}
            >
              <span
                className={cn(
                  "flex transition-transform duration-200 max-[400px]:scale-90 max-[360px]:scale-[0.85]",
                  page === tab.id && "scale-110",
                )}
              >
                <Icon
                  name={tab.icon}
                  size={22}
                  className={page === tab.id ? "text-lm-gold" : "text-lm-text2"}
                />
              </span>
              <span
                className={cn(
                  "text-[0.52rem] font-extrabold uppercase leading-none tracking-[0.3px] text-lm-text2 transition-colors duration-200 max-[400px]:text-[0.46rem] max-[360px]:text-[0.43rem]",
                  page === tab.id && "text-lm-gold",
                )}
              >
                {tab.label}
              </span>
              {tab.badge && (
                <span className="absolute right-1/2 top-[0.15rem] translate-x-[60%] rounded-full bg-lm-red2 px-1 py-0.5 text-[0.44rem] font-black leading-snug text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          id="bnav-more"
          className={cn(
            "lm-focus-ring relative flex h-full flex-1 flex-col items-center justify-center gap-1 border-0 border-t-2 border-transparent bg-transparent px-0.5 py-1 font-sans transition-all duration-200",
            moreActive && "border-t-lm-gold",
          )}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          aria-controls="moreMenu"
          onClick={onToggleMore}
        >
          <Icon
            name="menu"
            size={22}
            className={cn(moreActive ? "scale-110 text-lm-gold" : "text-lm-text2")}
          />
          <span
            className={cn(
              "text-[0.52rem] font-extrabold uppercase leading-none text-lm-text2",
              moreActive && "text-lm-gold",
            )}
          >
            Más
          </span>
        </button>
      </nav>

      {moreOpen && (
        <>
          <div
            id="moreOverlay"
            className="fixed inset-0 z-[199]"
            onClick={onToggleMore}
            aria-hidden
          />
          <MoreMenu
            onNavigate={onNavigate}
            onClose={onToggleMore}
            onOpenDiscord={onOpenDiscord}
          />
        </>
      )}
    </>
  );
}

function MoreMenu({
  onNavigate,
  onClose,
  onOpenDiscord,
}: {
  onNavigate: (p: PageId, idx?: number) => void;
  onClose: () => void;
  onOpenDiscord: () => void;
}) {
  const menuRef = useFocusTrap<HTMLDivElement>(true, { initialFocus: "first" });

  return (
    <div
      ref={menuRef}
      id="moreMenu"
      role="menu"
      aria-label="Más secciones"
      className="fixed left-3 right-3 z-[200] rounded-2xl border border-lm-border2 bg-lm-card p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
      style={{ bottom: "calc(var(--lm-bottom-nav-height) + 0.5rem)" }}
    >
      <div className="mb-2.5 px-1.5 text-[0.55rem] font-extrabold uppercase tracking-[2px] text-lm-text2">
        Más secciones
      </div>
      <MoreItem
        icon="book-open"
        title="Consejos"
        sub="Guías diarias de looksmaxing"
        onClick={() => {
          onNavigate("consejo", 4);
          onClose();
        }}
      />
      <MoreItem
        icon="book-marked"
        title="Léxico"
        sub="Términos del looksmaxing"
        onClick={() => {
          onNavigate("lexico", 5);
          onClose();
        }}
      />
      <button
        type="button"
        role="menuitem"
        className="lm-focus-ring mt-1.5 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-lm-border bg-[rgba(232,184,75,0.06)] px-1.5 py-2.5 text-left"
        onClick={() => {
          onOpenDiscord();
          onClose();
        }}
      >
        <Icon name="star" size={20} className="text-lm-gold" />
        <div>
          <div className="text-[0.85rem] font-extrabold text-lm-gold">Unirse a la comunidad</div>
          <div className="text-[0.65rem] text-lm-text2">Discord exclusivo</div>
        </div>
      </button>
    </div>
  );
}

function MoreItem({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: IconName;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="lm-focus-ring flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-1.5 py-2.5 text-left hover:bg-lm-bg3"
      onClick={onClick}
    >
      <Icon name={icon} size={20} className="text-lm-gold" />
      <div>
        <div className="text-[0.85rem] font-extrabold">{title}</div>
        <div className="text-[0.65rem] text-lm-text2">{sub}</div>
      </div>
    </button>
  );
}
