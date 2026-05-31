"use client";

import { Icon, IconLabel } from "@/components/icons";
import { TICKER_ITEMS } from "@/features/app/data/ticker";
import { cn } from "@/lib/cn";

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className={cn(
        "relative z-[101] flex h-[var(--lm-ticker-height)] items-center overflow-hidden",
        "border-b border-lm-border bg-[rgba(232,184,75,0.06)] max-md:hidden",
      )}
    >
      <div
        className={cn(
          "flex h-full shrink-0 items-center gap-1 bg-lm-gold px-3",
          "text-sm font-bold tracking-wide whitespace-nowrap text-black",
        )}
      >
        <IconLabel icon="flame" iconSize={14} iconClassName="text-black">
          NOTICIAS
        </IconLabel>
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex animate-ticker gap-12 whitespace-nowrap" id="tickerInner">
          {items.map((t, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-1.5 text-base font-semibold text-lm-text2"
            >
              <Icon name={t.icon} size={14} className="text-lm-gold" />
              {t.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
