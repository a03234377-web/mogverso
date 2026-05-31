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
        r="8"
        className="lm-qa-torneo-ring lm-qa-torneo-ring--outer stroke-black [stroke-linecap:round]"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        className="lm-qa-torneo-ring lm-qa-torneo-ring--mid stroke-black [stroke-linecap:round]"
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
        "cursor-pointer overflow-hidden rounded-[14px] border-none px-8 py-3",
        "font-sans text-lg leading-tight font-bold text-black lm-focus-ring-on-gold",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5",
        "max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-base",
        modifier,
      )}
      onClick={onClick}
    >
      <span
        aria-hidden
        className="lm-quick-action-gradient pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0",
          "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_62%)]",
          "transition-opacity duration-300 group-hover/qa:opacity-100",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "lm-quick-action-shimmer pointer-events-none absolute inset-0 rounded-[inherit]",
          "bg-[linear-gradient(105deg,transparent_32%,rgba(255,255,255,0.5)_50%,transparent_68%)]",
          "opacity-0 group-hover/qa:opacity-100",
        )}
      />
      <span
        aria-hidden
        className="lm-quick-action-aura pointer-events-none absolute -inset-1 rounded-[inherit] border opacity-0"
      />
      <span className="relative z-[1] flex items-center justify-center gap-2">
        {icon}
        <span
          className={cn(
            "lm-quick-action-label transition-[letter-spacing,transform] duration-300",
            "group-hover/qa:tracking-wide",
          )}
        >
          {label}
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
