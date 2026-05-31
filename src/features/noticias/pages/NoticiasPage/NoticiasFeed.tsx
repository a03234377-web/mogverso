"use client";

import { useMemo, useState } from "react";
import { formatEventTime } from "@/features/noticias/lib/format-event-time";
import {
  DEFAULT_NOTICIAS_FILTER,
  filterNoticiaEvents,
  noticiasFilterEmptyMessage,
  NOTICIAS_FILTERS,
  type NoticiasFilterId,
} from "@/features/noticias/lib/noticias-filter";
import { useNoticiasFeed } from "@/features/noticias/hooks/useNoticiasFeed";
import { NoticiaCard } from "./NoticiaCard";
import { NoticiasFilterTabs } from "./NoticiasFilterTabs";
import { cn } from "@/lib/cn";

function NoticiasSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[140px] animate-pulse rounded-xl border border-lm-border bg-lm-card",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function NoticiasEmpty({ message }: { message: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed border-lm-border bg-lm-card/50 px-4 py-8",
        "text-center text-base font-semibold text-lm-text2",
      )}
    >
      {message}
    </p>
  );
}

function useFilterCounts(events: ReturnType<typeof useNoticiasFeed>["events"]) {
  return useMemo(() => {
    const counts = Object.fromEntries(
      NOTICIAS_FILTERS.map((f) => [f.id, 0]),
    ) as Record<NoticiasFilterId, number>;
    for (const tab of NOTICIAS_FILTERS) {
      counts[tab.id] = filterNoticiaEvents(events, tab.id).length;
    }
    return counts;
  }, [events]);
}

export function NoticiasFeed() {
  const { events, ready, isEmpty } = useNoticiasFeed();
  const [filter, setFilter] = useState<NoticiasFilterId>(DEFAULT_NOTICIAS_FILTER);
  const counts = useFilterCounts(events);
  const filtered = useMemo(
    () => filterNoticiaEvents(events, filter),
    [events, filter],
  );
  const filterEmpty = ready && !isEmpty && filtered.length === 0;

  if (!ready) {
    return <NoticiasSkeleton />;
  }

  return (
    <>
      <NoticiasFilterTabs value={filter} onChange={setFilter} counts={counts} />
      {isEmpty ? (
        <NoticiasEmpty message={noticiasFilterEmptyMessage("todas")} />
      ) : filterEmpty ? (
        <NoticiasEmpty message={noticiasFilterEmptyMessage(filter)} />
      ) : (
        <div
          id="noticias-feed-panel"
          role="tabpanel"
          className="grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5"
        >
          {filtered.map((event) => (
            <NoticiaCard
              key={event.id}
              kind={event.kind}
              catIcon={event.catIcon}
              catLabel={event.catLabel}
              title={event.title}
              body={event.body}
              tag={event.tag}
              time={formatEventTime(event.ts)}
              profileNames={event.profileNames}
            />
          ))}
        </div>
      )}
    </>
  );
}
