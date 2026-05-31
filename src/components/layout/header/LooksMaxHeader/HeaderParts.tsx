"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { cn } from "@/lib/cn";

export function BrandLink({
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
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))]",
          "text-black shadow-[0_0_20px_rgba(232,184,75,0.35)]",
          "transition-transform duration-200 group-hover:scale-105 max-md:h-9 max-md:w-9",
        )}
        aria-hidden
      >
        <Icon name="crown" size={22} />
      </div>
      <div
        id="logo-container"
        className="lm-logo-scroll hidden min-w-0 leading-tight lg:block"
        style={{ "--logo-opacity": logoOpacity } as CSSProperties}
        aria-hidden={isLogoInteractive ? undefined : true}
        tabIndex={isLogoInteractive ? undefined : -1}
      >
        <div
          className={cn(
            "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold2))]",
            "bg-clip-text font-display text-[1.35rem] tracking-[0.06em] text-transparent",
          )}
        >
          LooksMax<span className="text-lm-gold">ES</span>
        </div>
        <span className="block font-sans text-sm font-semibold tracking-wide text-lm-text2 max-lg:hidden">
          España · Ranking
        </span>
      </div>
    </Link>
  );
}

export function NavBadge({
  children,
  variant,
  className,
}: {
  children: string;
  variant: "live" | "hot";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-1.5 py-0.5 text-[0.6875rem]",
        "leading-none font-black tracking-wide text-white uppercase",
        variant === "live" ? "animate-pulse-soft bg-lm-orange" : "bg-lm-red2",
        className,
      )}
    >
      {children}
    </span>
  );
}
