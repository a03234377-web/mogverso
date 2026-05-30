"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { cn } from "@/lib/cn";
import { DESKTOP_TABS, sectionTitle } from "@/components/layout/header/nav-config";
import { useHeaderScroll } from "@/components/layout/header/useHeaderScroll";
import type { LooksMaxHeaderProps } from "@/components/layout/header/types";

function BrandLink({
  logoOpacity,
  isLogoInteractive,
}: {
  logoOpacity: number;
  isLogoInteractive: boolean;
}) {
  return (
    <Link
      href={LOOKSMAX_PATHS.rankings}
      className="group flex shrink-0 items-center gap-2.5 rounded-xl no-underline lm-focus-ring outline-offset-4"
      aria-label="LooksMax España — Ir a Rankings"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] text-black shadow-[0_0_20px_rgba(232,184,75,0.35)] transition-transform duration-200 group-hover:scale-105 max-md:h-9 max-md:w-9"
        aria-hidden
      >
        <Icon name="crown" size={22} />
      </div>
      <div
        id="logo-container"
        className="lm-logo-scroll min-w-0 leading-tight max-md:hidden"
        style={{ "--logo-opacity": logoOpacity } as CSSProperties}
        aria-hidden={isLogoInteractive ? undefined : true}
        tabIndex={isLogoInteractive ? undefined : -1}
      >
        <div className="bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold2))] bg-clip-text font-display text-[1.35rem] tracking-[2px] text-transparent">
          LooksMax<span className="text-lm-gold">ES</span>
        </div>
        <span className="block font-sans text-sm font-semibold tracking-wide text-lm-text2 max-lg:hidden">
          España · Ranking
        </span>
      </div>
    </Link>
  );
}

function NavBadge({
  children,
  variant,
}: {
  children: string;
  variant: "live" | "hot";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[0.6875rem] leading-none font-black tracking-wide text-white uppercase",
        variant === "live" ? "animate-pulse-soft bg-lm-orange" : "bg-lm-red2",
      )}
    >
      {children}
    </span>
  );
}

export function LooksMaxHeader({ page, onOpenDiscord }: LooksMaxHeaderProps) {
  const { headerOpacity, logoOpacity, isLogoInteractive } = useHeaderScroll();

  return (
    <header
      id="header"
      className="lm-header-scroll sticky top-0 z-[100]"
      style={{ "--header-opacity": headerOpacity } as CSSProperties}
    >
      <div
        className="lm-header-scroll-accent pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(232,184,75,0.45),transparent)]"
        aria-hidden
      />
      <nav
        className="mx-auto flex h-[var(--lm-nav-height)] max-w-[1400px] items-center justify-between gap-3 px-4 md:gap-4 md:px-5"
        aria-label="Navegación principal"
      >
        <BrandLink logoOpacity={logoOpacity} isLogoInteractive={isLogoInteractive} />

        <div className="min-w-0 flex-1 truncate text-center font-sans text-sm font-bold tracking-wide text-lm-gold uppercase md:hidden">
          {sectionTitle(page)}
        </div>

        <div
          className="hidden min-w-0 flex-1 items-center justify-center md:flex lg:max-w-2xl xl:max-w-3xl"
          id="desktopTabs"
          aria-label="Secciones"
        >
          <div className="scrollbar-none flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-lm-border bg-lm-bg2/90 p-1">
            {DESKTOP_TABS.map((tab) => {
              const active = page === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={LOOKSMAX_PATHS[tab.id]}
                  id={`nav-desktop-${tab.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 font-sans text-sm font-bold whitespace-nowrap no-underline lm-focus-ring transition-colors duration-200 lg:px-3.5 lg:text-[0.9375rem]",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(232,184,75,0.22),rgba(232,184,75,0.08))] text-lm-gold shadow-[inset_0_0_0_1px_rgba(232,184,75,0.35)]"
                      : "text-lm-text2 hover:text-lm-gold2",
                  )}
                >
                  <Icon
                    name={tab.icon}
                    size={16}
                    className={cn(
                      "transition-colors duration-200",
                      active
                        ? "text-lm-gold"
                        : "text-lm-text2 opacity-80 group-hover:text-lm-gold2 group-hover:opacity-100",
                    )}
                  />
                  <span className="max-xl:hidden">{tab.label}</span>
                  <span className="xl:hidden">{tab.label.split(" ")[0]}</span>
                  {tab.badge && (
                    <NavBadge
                      variant={tab.badgeClass === "tab-badge-new" ? "live" : "hot"}
                    >
                      {tab.badge}
                    </NavBadge>
                  )}
                  {!active && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-3 bottom-1.5 h-0.5 origin-center scale-x-0 rounded-full bg-[linear-gradient(90deg,var(--color-lm-gold2),var(--color-lm-gold))] transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Unirse a la comunidad"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(232,184,75,0.35)] bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] px-3.5 py-2 font-sans text-sm leading-none font-bold tracking-normal text-black shadow-[0_0_16px_rgba(232,184,75,0.25)] lm-focus-ring-on-gold transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_22px_rgba(232,184,75,0.4)] max-md:px-3 max-md:py-1.5"
            onClick={onOpenDiscord}
          >
            <Icon name="star" size={16} className="text-black" />
            <span className="max-sm:hidden">Unirse</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
