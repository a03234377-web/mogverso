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

function FilterCountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5",
        "text-[11px] leading-none font-bold tabular-nums",
        active
          ? "bg-lm-gold/20 text-lm-gold"
          : "bg-lm-bg3 text-lm-text2 group-hover:bg-lm-bg3/80 group-hover:text-lm-gold2",
      )}
      aria-hidden
    >
      {count}
    </span>
  );
}

export function NoticiasFilterTabs({
  value,
  onChange,
  counts,
}: NoticiasFilterTabsProps) {
  return (
    <div className="mb-4" role="tablist" aria-label="Filtrar noticias">
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-1 rounded-2xl border border-lm-border bg-lm-bg2/90 p-1",
          "max-md:gap-y-1",
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
              aria-label={`${tab.label}, ${count} noticias`}
              title={tab.description}
              onClick={() => onChange(tab.id)}
              className={cn(
                "group relative flex cursor-pointer items-center gap-1.5 rounded-full",
                "px-2.5 py-2 font-sans text-sm font-bold whitespace-nowrap",
                "lm-focus-ring transition-colors duration-200",
                "max-md:min-h-10 max-md:px-2.5 max-md:text-[0.8125rem]",
                active
                  ? cn(
                      "bg-[linear-gradient(135deg,rgba(232,184,75,0.22),rgba(232,184,75,0.08))]",
                      "text-lm-gold shadow-[inset_0_0_0_1px_rgba(232,184,75,0.35)]",
                    )
                  : "text-lm-text2 hover:text-lm-gold2",
              )}
            >
              <span aria-hidden className="md:hidden">
                {tab.shortLabel}
              </span>

              <span className="hidden md:inline">{tab.label}</span>
              <FilterCountBadge count={count} active={active} />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm leading-snug font-medium text-lm-text2 max-md:text-[0.8125rem]">
        {NOTICIAS_FILTERS.find((t) => t.id === value)?.description}
      </p>
    </div>
  );
}
