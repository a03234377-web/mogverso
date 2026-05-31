"use client";

import {
  NOTICIAS_FILTERS,
  type NoticiasFilterId,
} from "@/features/noticias/lib/noticias-filter";
import { cn } from "@/lib/cn";

type NoticiasFilterTabsProps = {
  value: NoticiasFilterId;
  onChange: (id: NoticiasFilterId) => void;
  counts: Record<NoticiasFilterId, number>;
};

export function NoticiasFilterTabs({
  value,
  onChange,
  counts,
}: NoticiasFilterTabsProps) {
  return (
    <div className="mb-4" role="tablist" aria-label="Filtrar noticias">
      <div
        className={cn(
          "scrollbar-none flex w-full flex-wrap items-center gap-1 overflow-x-auto",
          "rounded-full border border-lm-border bg-lm-bg2/90 p-0.5 max-md:p-1",
        )}
      >
        {NOTICIAS_FILTERS.map((tab) => {
          const active = value === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="noticias-feed-panel"
              title={tab.description}
              onClick={() => onChange(tab.id)}
              className={cn(
                "group relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full",
                "px-2.5 py-1.5 font-sans text-sm font-bold whitespace-nowrap",
                "lm-focus-ring transition-colors duration-200 max-md:px-2 max-md:py-1.5 max-md:text-[0.8125rem]",
                active
                  ? cn(
                      "bg-[linear-gradient(135deg,rgba(232,184,75,0.22),rgba(232,184,75,0.08))]",
                      "text-lm-gold shadow-[inset_0_0_0_1px_rgba(232,184,75,0.35)]",
                    )
                  : "text-lm-text2 hover:text-lm-gold2",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "min-w-[1.25rem] rounded-full px-1 py-px text-center text-xs font-bold tabular-nums",
                  active
                    ? "bg-lm-gold/20 text-lm-gold"
                    : "bg-lm-bg3 text-lm-text2 group-hover:text-lm-gold2",
                )}
                aria-label={`${count} noticias`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-medium text-lm-text2">
        {NOTICIAS_FILTERS.find((t) => t.id === value)?.description}
      </p>
    </div>
  );
}
