import type { TickerItem } from "@/features/app/data/ticker";
import { noticiaKindLabelClass } from "./noticia-kind-colors";
import type { NoticiaEvent } from "./noticia-event";

const MAX_TICKER_ITEMS = 12;

export function buildTickerItems(events: NoticiaEvent[]): TickerItem[] {
  return events.slice(0, MAX_TICKER_ITEMS).map((event) => ({
    id: event.id,
    icon: event.catIcon,
    text: event.title,
    labelClass: noticiaKindLabelClass(event.kind),
  }));
}
