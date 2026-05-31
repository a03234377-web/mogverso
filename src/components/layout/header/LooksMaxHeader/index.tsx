"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { BrandLink, NavBadge } from "./HeaderParts";
import { cn } from "@/lib/cn";
import { DESKTOP_TABS, sectionTitle } from "@/components/layout/header/nav-config";
import { useHeaderScroll } from "@/components/layout/header/useHeaderScroll";
import type { LooksMaxHeaderProps } from "@/components/layout/header/types";

export function LooksMaxHeader({ page, onOpenDiscord }: LooksMaxHeaderProps) {
  const { headerOpacity, logoOpacity, isLogoInteractive } = useHeaderScroll();

  return (
    <header
      id="header"
      className="lm-header-scroll sticky top-0 z-[100]"
      style={{ "--header-opacity": headerOpacity } as CSSProperties}
    >
      <div
        className={cn(
          "lm-header-scroll-accent pointer-events-none absolute inset-x-0 bottom-0 h-px",
          "bg-[linear-gradient(90deg,transparent,rgba(232,184,75,0.45),transparent)]",
        )}
        aria-hidden
      />
      <nav
        className={cn(
          "mx-auto flex h-[var(--lm-nav-height)] max-w-[1400px] min-w-0",
          "items-center justify-between gap-2 px-3 md:gap-2 md:px-4 lg:gap-3 lg:px-5",
        )}
        aria-label="Navegación principal"
      >
        <BrandLink logoOpacity={logoOpacity} isLogoInteractive={isLogoInteractive} />

        <div
          className={cn(
            "min-w-0 flex-1 truncate text-center font-sans text-sm font-bold",
            "tracking-wide text-lm-gold uppercase md:hidden",
          )}
        >
          {sectionTitle(page)}
        </div>

        <div
          className="hidden min-w-0 flex-1 basis-0 items-center justify-center overflow-hidden md:flex"
          id="desktopTabs"
          aria-label="Secciones"
        >
          <div
            className={cn(
              "scrollbar-none flex w-fit max-w-full items-center gap-0.5 overflow-x-auto",
              "rounded-full border border-lm-border bg-lm-bg2/90 p-0.5 max-lg:w-full md:p-1",
            )}
          >
            {DESKTOP_TABS.map((tab) => {
              const active = page === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={LOOKSMAX_PATHS[tab.id]}
                  id={`nav-desktop-${tab.id}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={tab.label}
                  title={tab.label}
                  className={cn(
                    "group relative flex shrink-0 cursor-pointer items-center gap-1 rounded-full",
                    "px-2 py-1.5 font-sans text-sm font-bold whitespace-nowrap no-underline",
                    "lm-focus-ring transition-colors duration-200",
                    "md:gap-1.5 md:px-2.5 md:py-2 lg:px-3.5 lg:text-[0.9375rem]",
                    active
                      ? cn(
                          "bg-[linear-gradient(135deg,rgba(232,184,75,0.22),rgba(232,184,75,0.08))]",
                          "text-lm-gold shadow-[inset_0_0_0_1px_rgba(232,184,75,0.35)]",
                        )
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
                  <span className="hidden lg:inline">{tab.label}</span>
                  {tab.badge && (
                    <NavBadge
                      variant={tab.badgeClass === "tab-badge-new" ? "live" : "hot"}
                      className="hidden xl:inline-flex"
                    >
                      {tab.badge}
                    </NavBadge>
                  )}
                  {!active && (
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-x-3 bottom-1.5 h-0.5",
                        "origin-center scale-x-0 rounded-full",
                        "bg-[linear-gradient(90deg,var(--color-lm-gold2),var(--color-lm-gold))]",
                        "transition-transform duration-200 ease-out",
                        "group-hover:scale-x-100 group-focus-visible:scale-x-100",
                      )}
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
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full",
              "border border-[rgba(232,184,75,0.35)]",
              "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))]",
              "px-2.5 py-1.5 font-sans text-sm leading-none font-bold tracking-normal text-black",
              "shadow-[0_0_16px_rgba(232,184,75,0.25)] lm-focus-ring-on-gold",
              "transition-all duration-200 hover:scale-[1.03]",
              "hover:shadow-[0_0_22px_rgba(232,184,75,0.4)] md:px-3 md:py-2 lg:px-3.5",
            )}
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
