"use client";

import type { NavigationProps, PageId } from "@/components/looksmax/types";
import { cn } from "@/lib/cn";

const DESKTOP_TABS: { id: PageId; label: string; badge?: string; badgeClass?: string }[] = [
  { id: "rankings", label: "🏆 Rankings" },
  { id: "rankvote", label: "🗳️ Votar Rank" },
  { id: "torneo", label: "⚽ Torneo", badge: "LIVE", badgeClass: "tab-badge-new" },
  { id: "noticias", label: "📰 Noticias", badge: "HOT", badgeClass: "tab-badge" },
  { id: "consejo", label: "📖 Consejos" },
  { id: "lexico", label: "📚 Léxico" },
];

const BNAV: { id: PageId; label: string; icon: string; badge?: string; tabIdx: number }[] = [
  { id: "rankings", label: "Rankings", icon: "🏆", tabIdx: 0 },
  { id: "rankvote", label: "Votar", icon: "🗳️", tabIdx: 1 },
  { id: "torneo", label: "Torneo", icon: "⚽", badge: "LIVE", tabIdx: 2 },
  { id: "noticias", label: "Noticias", icon: "📰", badge: "HOT", tabIdx: 3 },
];

type NavProps = NavigationProps & {
  moreOpen: boolean;
  onToggleMore: () => void;
};

export function DesktopNav({ page, onNavigate, onOpenDiscord }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-[100] flex h-[var(--lm-nav-height)] items-center justify-between gap-2 border-b border-lm-border bg-[rgba(7,9,15,0.96)] px-5 backdrop-blur-2xl max-md:px-4">
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 animate-logo-pulse items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] text-[1.2rem] shadow-[0_0_16px_rgba(232,184,75,0.3)] select-none max-md:h-8 max-md:w-8 max-md:rounded-lg max-md:text-[1.1rem]">
          👑
        </div>
        <div className="font-display bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold2))] bg-clip-text text-[1.2rem] leading-none tracking-[2px] text-transparent whitespace-nowrap max-md:text-base max-md:tracking-wide">
          LooksMax<span className="text-lm-gold">ES</span>
          <span className="block font-sans text-[0.55rem] font-semibold tracking-[2px] text-lm-text2">
            España · Ranking
          </span>
        </div>
      </div>
      <div className="hidden items-center gap-0 overflow-x-auto scrollbar-none md:flex" id="desktopTabs">
        {DESKTOP_TABS.map((tab, idx) => (
          <div
            key={tab.id}
            className={cn(
              "flex h-[var(--lm-nav-height)] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap px-3 text-[0.7rem] font-bold uppercase tracking-[0.8px] text-lm-text2 transition-all duration-250 select-none hover:text-lm-text",
              page === tab.id && "border-b-2 border-lm-gold text-lm-gold",
            )}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(tab.id, idx)}
            onKeyDown={(e) => e.key === "Enter" && onNavigate(tab.id, idx)}
          >
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
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-lg border-none bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] px-3.5 py-2 font-sans text-[0.7rem] font-extrabold uppercase tracking-[0.8px] text-black transition-all duration-200 select-none hover:scale-[1.04] max-md:min-h-9 max-md:px-3 max-md:py-1.5 max-md:text-[0.68rem]"
          onClick={onOpenDiscord}
        >
          ⭐ Unirse
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

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] hidden h-[var(--lm-bottom-nav-height)] items-center justify-around border-t border-lm-border bg-[rgba(7,9,15,0.98)] px-2 backdrop-blur-2xl max-md:flex"
        id="bottomNav"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {BNAV.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "relative flex h-full flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent px-0.5 py-1 transition-all duration-200",
              page === tab.id && "border-t-lm-gold",
            )}
            id={`bnav-${tab.id}`}
            role="button"
            tabIndex={0}
            onClick={() => onNavigate(tab.id, tab.tabIdx)}
            onKeyDown={(e) => e.key === "Enter" && onNavigate(tab.id, tab.tabIdx)}
          >
            <span
              className={cn(
                "text-[1.4rem] leading-none transition-transform duration-200 max-[400px]:text-xl max-[360px]:text-[1.15rem]",
                page === tab.id && "scale-110",
              )}
            >
              {tab.icon}
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
          </div>
        ))}
        <div
          className={cn(
            "relative flex h-full flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent px-0.5 py-1 transition-all duration-200",
            moreActive && "border-t-lm-gold",
          )}
          id="bnav-more"
          role="button"
          tabIndex={0}
          onClick={onToggleMore}
          onKeyDown={(e) => e.key === "Enter" && onToggleMore()}
        >
          <span className={cn("text-[1.4rem] leading-none", moreActive && "scale-110")}>☰</span>
          <span
            className={cn(
              "text-[0.52rem] font-extrabold uppercase leading-none text-lm-text2",
              moreActive && "text-lm-gold",
            )}
          >
            Más
          </span>
        </div>
      </nav>

      {moreOpen && (
        <>
          <div
            id="moreOverlay"
            className="fixed inset-0 z-[199]"
            onClick={onToggleMore}
            aria-hidden
          />
          <MoreMenu onNavigate={onNavigate} onClose={onToggleMore} onOpenDiscord={onOpenDiscord} />
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
  return (
    <div
      id="moreMenu"
      className="fixed left-3 right-3 z-[200] rounded-2xl border border-lm-border2 bg-lm-card p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
      style={{ bottom: "calc(var(--lm-bottom-nav-height) + 0.5rem)" }}
    >
      <div className="mb-2.5 px-1.5 text-[0.55rem] font-extrabold uppercase tracking-[2px] text-lm-text2">
        Más secciones
      </div>
      <MoreItem
        icon="📖"
        title="Consejos"
        sub="Guías diarias de looksmaxing"
        onClick={() => {
          onNavigate("consejo", 4);
          onClose();
        }}
      />
      <MoreItem
        icon="📚"
        title="Léxico"
        sub="Términos del looksmaxing"
        onClick={() => {
          onNavigate("lexico", 5);
          onClose();
        }}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          onOpenDiscord();
          onClose();
        }}
        onKeyDown={(e) => e.key === "Enter" && (onOpenDiscord(), onClose())}
        className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-lm-border bg-[rgba(232,184,75,0.06)] px-1.5 py-2.5"
      >
        <span className="text-[1.2rem]">⭐</span>
        <div>
          <div className="text-[0.85rem] font-extrabold text-lm-gold">Unirse a la comunidad</div>
          <div className="text-[0.65rem] text-lm-text2">Discord exclusivo</div>
        </div>
      </div>
    </div>
  );
}

function MoreItem({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-2.5 hover:bg-lm-bg3"
    >
      <span className="text-[1.2rem]">{icon}</span>
      <div>
        <div className="text-[0.85rem] font-extrabold">{title}</div>
        <div className="text-[0.65rem] text-lm-text2">{sub}</div>
      </div>
    </div>
  );
}
