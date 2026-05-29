"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Keys } from "@/lib/a11y/keyboard";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { PAGE_PANEL_IDS } from "@/lib/a11y/page-panels";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useRovingTabIndex } from "@/hooks/useRovingTabIndex";
import { BNAV, bottomSelectedIndex } from "@/components/layout/footer/nav-config";
import type { LooksMaxFooterProps } from "@/components/layout/footer/types";
import type { IconName } from "@/types/icons";

function isRovingKey(key: string): boolean {
  return (
    key === Keys.ArrowLeft ||
    key === Keys.ArrowRight ||
    key === Keys.Home ||
    key === Keys.End
  );
}

export function LooksMaxFooter({
  page,
  onOpenDiscord,
  moreOpen,
  onToggleMore,
}: LooksMaxFooterProps) {
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
      <footer
        className="fixed right-0 bottom-0 left-0 z-[100] hidden border-t border-lm-border bg-[rgba(7,9,15,0.96)] shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl max-md:block"
        id="bottomNav"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height:
            "calc(var(--lm-bottom-nav-height) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <nav
          className="flex h-[var(--lm-bottom-nav-height)] w-full items-stretch justify-around px-1"
          aria-label="Navegación móvil"
          role="tablist"
          onKeyDown={onTabListKeyDown}
        >
          {BNAV.map((tab, idx) => {
            const active = page === tab.id;
            return (
              <Link
                key={tab.id}
                href={LOOKSMAX_PATHS[tab.id]}
                role="tab"
                id={`tab-bnav-${tab.id}`}
                aria-controls={PAGE_PANEL_IDS[tab.id]}
                aria-selected={active}
                tabIndex={getTabIndex(idx)}
                className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 no-underline lm-focus-ring"
                onClick={() => syncFocusedIndex(idx)}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                    active &&
                      "bg-[rgba(232,184,75,0.15)] shadow-[inset_0_0_0_1px_rgba(232,184,75,0.3)]",
                  )}
                >
                  <Icon
                    name={tab.icon}
                    size={22}
                    className={active ? "text-lm-gold" : "text-lm-text2"}
                  />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate px-0.5 text-xs leading-snug font-bold",
                    active ? "text-lm-gold" : "text-lm-text2",
                  )}
                >
                  {tab.label}
                </span>
                {tab.badge && (
                  <span className="absolute top-1 right-[18%] rounded-full bg-lm-orange px-1 py-px text-[0.625rem] leading-none font-black text-white">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            id="bnav-more"
            className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-0 bg-transparent font-sans lm-focus-ring"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            aria-controls="moreMenu"
            onClick={onToggleMore}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                (moreActive || moreOpen) &&
                  "bg-[rgba(232,184,75,0.15)] shadow-[inset_0_0_0_1px_rgba(232,184,75,0.3)]",
              )}
            >
              <Icon
                name="menu"
                size={22}
                className={moreActive || moreOpen ? "text-lm-gold" : "text-lm-text2"}
              />
            </span>
            <span
              className={cn(
                "text-xs leading-snug font-bold",
                moreActive || moreOpen ? "text-lm-gold" : "text-lm-text2",
              )}
            >
              Más
            </span>
          </button>
        </nav>
      </footer>

      {moreOpen && (
        <>
          <div
            id="moreOverlay"
            className="fixed inset-0 z-[199]"
            onClick={onToggleMore}
            aria-hidden
          />
          <MoreMenu onClose={onToggleMore} onOpenDiscord={onOpenDiscord} />
        </>
      )}
    </>
  );
}

function MoreMenu({
  onClose,
  onOpenDiscord,
}: {
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
      className="fixed right-3 left-3 z-[200] rounded-2xl border border-lm-border2 bg-lm-card p-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
      style={{ bottom: "calc(var(--lm-bottom-nav-height) + 0.5rem)" }}
    >
      <div className="mb-2.5 px-1.5 text-sm font-extrabold tracking-[2px] text-lm-text2 uppercase">
        Más secciones
      </div>
      <MoreLinkItem
        href={LOOKSMAX_PATHS.consejo}
        icon="book-open"
        title="Consejos"
        sub="Guías diarias de looksmaxing"
        onClose={onClose}
      />
      <MoreLinkItem
        href={LOOKSMAX_PATHS.lexico}
        icon="book-marked"
        title="Léxico"
        sub="Términos del looksmaxing"
        onClose={onClose}
      />
      <button
        type="button"
        role="menuitem"
        className="mt-1.5 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-lm-border bg-[rgba(232,184,75,0.06)] px-1.5 py-2.5 text-left lm-focus-ring"
        onClick={() => {
          onOpenDiscord();
          onClose();
        }}
      >
        <Icon name="star" size={20} className="text-lm-gold" />
        <div>
          <div className="text-base font-extrabold text-lm-gold">
            Unirse a la comunidad
          </div>
          <div className="text-sm text-lm-text2">Discord exclusivo</div>
        </div>
      </button>
    </div>
  );
}

function MoreLinkItem({
  href,
  icon,
  title,
  sub,
  onClose,
}: {
  href: string;
  icon: IconName;
  title: string;
  sub: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-1.5 py-2.5 text-left no-underline lm-focus-ring transition-colors duration-200 hover:bg-[rgba(232,184,75,0.1)] hover:text-lm-gold2"
      onClick={onClose}
    >
      <Icon name={icon} size={20} className="text-lm-gold" />
      <div>
        <div className="text-base font-extrabold text-lm-text">{title}</div>
        <div className="text-sm text-lm-text2">{sub}</div>
      </div>
    </Link>
  );
}
