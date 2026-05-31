"use client";

import { useMemo } from "react";
import { buildTickerItems } from "@/features/noticias/lib/build-ticker-items";
import { useNoticiasFeed } from "./useNoticiasFeed";

export function useTickerItems() {
  const { events, ready, isEmpty } = useNoticiasFeed();
  const items = useMemo(() => buildTickerItems(events), [events]);

  return {
    items,
    ready,
    visible: ready && !isEmpty && items.length > 0,
  };
}
