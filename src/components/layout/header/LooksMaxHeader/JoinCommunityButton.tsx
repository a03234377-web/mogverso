"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const STAR_POINTS =
  "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2";

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

function JoinStarIcon() {
  return (
    <span
      className="relative flex size-4 shrink-0 items-center justify-center md:size-[18px]"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="relative z-[1] size-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {SPARK_ANGLES.map((angle, index) => (
          <g key={angle} transform={`rotate(${angle} 12 12)`}>
            <line
              x1="12"
              y1="12"
              x2="12"
              y2="5"
              className={cn(
                "lm-join-star-spark stroke-[#1a1200]/80",
                "opacity-0 [stroke-linecap:round]",
              )}
              style={{ "--join-spark-delay": `${index * 35}ms` } as CSSProperties}
            />
          </g>
        ))}
        <g className="lm-join-star-body">
          <polygon points={STAR_POINTS} className="lm-join-star-fill fill-black" />
          <polygon
            points={STAR_POINTS}
            className={cn(
              "lm-join-star-trace fill-none stroke-[#1a1200]",
              "[stroke-linecap:round] [stroke-linejoin:round]",
            )}
          />
        </g>
      </svg>
    </span>
  );
}

type JoinCommunityButtonProps = {
  onClick: () => void;
};

export function JoinCommunityButton({ onClick }: JoinCommunityButtonProps) {
  return (
    <button
      type="button"
      aria-label="Unirse a la comunidad"
      className={cn(
        "lm-join-btn group/join relative isolate flex shrink-0 cursor-pointer",
        "items-center gap-1.5 overflow-hidden rounded-full",
        "border border-[rgba(232,184,75,0.35)]",
        "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))]",
        "px-2.5 py-1.5 font-sans text-sm leading-none font-bold tracking-normal text-black",
        "shadow-[0_0_16px_rgba(232,184,75,0.25)] lm-focus-ring-on-gold",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-px hover:border-[rgba(255,240,180,0.55)]",
        "hover:shadow-[0_0_28px_rgba(232,184,75,0.55),0_4px_18px_rgba(0,0,0,0.25)]",
        "md:px-3 md:py-2 lg:px-3.5",
      )}
      onClick={onClick}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-0",
          "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.35),transparent_68%)]",
          "transition-opacity duration-300 group-hover/join:opacity-100",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "lm-join-shimmer pointer-events-none absolute inset-0 rounded-full",
          "bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.55)_50%,transparent_65%)]",
          "opacity-0 group-hover/join:opacity-100",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "lm-join-aura pointer-events-none absolute -inset-1 rounded-full",
          "border border-white/25 opacity-0",
        )}
      />
      <JoinStarIcon />
      <span
        className={cn(
          "relative z-[1] transition-[letter-spacing] duration-300 max-sm:hidden",
          "group-hover/join:tracking-wide",
        )}
      >
        Unirse
      </span>
    </button>
  );
}
