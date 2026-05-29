"use client";

import { TICKER_ITEMS } from "@/data/ticker";

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative z-[101] flex h-[var(--lm-ticker-height)] items-center overflow-hidden border-b border-lm-border bg-[rgba(232,184,75,0.06)]">
      <div className="flex h-full shrink-0 items-center gap-1 whitespace-nowrap bg-lm-gold px-3 text-[0.6rem] font-extrabold tracking-[1.5px] text-black">
        🔥 NOTICIAS
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex animate-ticker gap-12 whitespace-nowrap" id="tickerInner">
          {items.map((t, i) => (
            <span key={i} className="shrink-0 text-[0.7rem] font-semibold text-lm-text2">
              📢 {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
