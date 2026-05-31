"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

function VoteActionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="lm-qa-icon relative size-[18px] shrink-0 overflow-visible"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"
        className="lm-qa-vote-box stroke-black [stroke-linecap:round] [stroke-linejoin:round]"
      />
      <path
        d="M22 19H2"
        className="lm-qa-vote-slot stroke-black [stroke-linecap:round]"
      />
      <rect
        x="5"
        y="7"
        width="14"
        height="12"
        rx="1"
        className="lm-qa-vote-fill fill-black/20"
      />
      <path
        d="m9 12 2 2 4-4"
        className="lm-qa-vote-check stroke-black [stroke-linecap:round] [stroke-linejoin:round]"
      />
    </svg>
  );
}

function TorneoActionIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="lm-qa-icon relative size-[18px] shrink-0 overflow-visible"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="7"
        className="lm-qa-torneo-ripple lm-qa-torneo-ripple--1 stroke-black/50 [stroke-linecap:round]"
      />
      <circle
        cx="12"
        cy="12"
        r="7"
        className="lm-qa-torneo-ripple lm-qa-torneo-ripple--2 stroke-black/50 [stroke-linecap:round]"
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        className="lm-qa-torneo-ring stroke-black [stroke-linecap:round]"
      />
      <circle cx="12" cy="12" r="1.5" className="lm-qa-torneo-core fill-black" />
      <path
        d="M12 4v2M12 18v2M4 12h2M18 12h2"
        className="lm-qa-torneo-cross stroke-black [stroke-linecap:round]"
      />
    </svg>
  );
}

type QuickActionVariant = "vote" | "torneo";

const VARIANT_CONFIG: Record<
  QuickActionVariant,
  {
    label: string;
    icon: ReactNode;
    modifier: string;
  }
> = {
  vote: {
    label: "VOTAR RANKING",
    icon: <VoteActionIcon />,
    modifier: "lm-quick-action-btn--vote",
  },
  torneo: {
    label: "TORNEO EN VIVO",
    icon: <TorneoActionIcon />,
    modifier: "lm-quick-action-btn--torneo",
  },
};

type RankingQuickActionButtonProps = {
  variant: QuickActionVariant;
  onClick: () => void;
};

export function RankingQuickActionButton({
  variant,
  onClick,
}: RankingQuickActionButtonProps) {
  const { label, icon, modifier } = VARIANT_CONFIG[variant];

  return (
    <button
      type="button"
      className={cn(
        "lm-quick-action-btn group/qa relative isolate min-h-[58px] w-full",
        "cursor-pointer overflow-hidden rounded-[14px] border border-transparent px-8 py-3",
        "font-sans text-lg leading-tight font-bold text-black lm-focus-ring-on-gold",
        "transition-[transform,box-shadow,border-color] duration-350 ease-out",
        "max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-base",
        modifier,
      )}
      onClick={onClick}
    >
      <span
        aria-hidden
        className="lm-quick-action-beam pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      <span
        aria-hidden
        className="lm-quick-action-inset pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      <span
        aria-hidden
        className={cn(
          "lm-quick-action-corner lm-quick-action-corner--tl",
          "pointer-events-none absolute top-1.5 left-1.5 size-1.5 rounded-[2px] bg-white/70 opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "lm-quick-action-corner lm-quick-action-corner--br",
          "pointer-events-none absolute right-1.5 bottom-1.5 size-1.5 rounded-[2px] bg-white/70 opacity-0",
        )}
      />
      <span className="relative z-[1] flex items-center justify-center gap-2.5">
        <span
          className={cn(
            "lm-quick-action-icon-shell flex size-7 shrink-0 items-center justify-center rounded-lg",
            "bg-black/10 transition-transform duration-350",
          )}
        >
          {icon}
        </span>
        <span className="lm-quick-action-label relative inline-block">
          <span className="lm-quick-action-label-text block">{label}</span>
        </span>
      </span>
    </button>
  );
}

export function QuickActionCaption({ children }: { children: ReactNode }) {
  return (
    <p
      className={cn(
        "m-0 text-center text-base leading-snug font-semibold text-lm-text2",
        "max-md:flex-[1.3] max-md:text-left max-md:text-base",
      )}
    >
      {children}
    </p>
  );
}

export function QuickActionRow({
  variant,
  caption,
  onClick,
}: {
  variant: QuickActionVariant;
  caption: string;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "flex w-[220px] flex-col items-center gap-2.5",
        "max-md:w-full max-md:flex-row max-md:gap-3.5",
      )}
    >
      <RankingQuickActionButton variant={variant} onClick={onClick} />
      <QuickActionCaption>{caption}</QuickActionCaption>
    </div>
  );
}
