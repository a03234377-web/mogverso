"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { MoreMenu } from "./MoreMenu";
import { cn } from "@/lib/cn";
import { BNAV } from "@/components/layout/footer/nav-config";
import type { LooksMaxFooterProps } from "@/components/layout/footer/types";

export function LooksMaxFooter({
  page,
  onOpenDiscord,
  moreOpen,
  onToggleMore,
}: LooksMaxFooterProps) {
  const moreActive = page === "consejo";

  return (
    <>
      <footer
        className={cn(
          "fixed right-0 bottom-0 left-0 z-[100] hidden border-t border-lm-border",
          "bg-[rgba(7,9,15,0.96)] shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl max-md:block",
        )}
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
        >
          {BNAV.map((tab) => {
            const active = page === tab.id;
            return (
              <Link
                key={tab.id}
                href={LOOKSMAX_PATHS[tab.id]}
                id={`nav-bnav-${tab.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center",
                  "gap-0.5 no-underline lm-focus-ring",
                )}
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
                  <span
                    className={cn(
                      "absolute top-1 right-[18%] rounded-full bg-lm-orange px-1 py-px",
                      "text-[0.625rem] leading-none font-black text-white",
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            id="bnav-more"
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5",
              "border-0 bg-transparent font-sans lm-focus-ring",
            )}
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
