import type { NoticiaEvent, NoticiaEventKind } from "./noticia-event";

export const NOTICIAS_FILTERS = [
  {
    id: "informaciongeneral",
    label: "Información general",
    shortLabel: "General",
    description: "Duelos de Rank Vote y quién vence a quién",
  },
  {
    id: "subida",
    label: "Subidas",
    shortLabel: "Subidas",
    description: "Rankers que han subido en el ranking",
  },
  {
    id: "bajada",
    label: "Bajadas",
    shortLabel: "Bajadas",
    description: "Rankers que han bajado en el ranking",
  },
  {
    id: "todas",
    label: "Todas",
    shortLabel: "Todas",
    description: "Todos los eventos recientes",
  },
] as const;

export type NoticiasFilterId = (typeof NOTICIAS_FILTERS)[number]["id"];

const FILTER_KIND: Record<Exclude<NoticiasFilterId, "todas">, NoticiaEventKind> = {
  informaciongeneral: "rankvote",
  subida: "subida",
  bajada: "bajada",
};

export const DEFAULT_NOTICIAS_FILTER: NoticiasFilterId = "informaciongeneral";

export function filterNoticiaEvents(
  events: NoticiaEvent[],
  filter: NoticiasFilterId,
): NoticiaEvent[] {
  if (filter === "todas") return events;
  const kind = FILTER_KIND[filter];
  return events.filter((e) => e.kind === kind);
}

export function noticiasFilterEmptyMessage(filter: NoticiasFilterId): string {
  switch (filter) {
    case "informaciongeneral":
      return "Aún no hay duelos recientes de Rank Vote. Cuando alguien venza a otro, aparecerá aquí.";
    case "subida":
      return "Nadie ha subido puestos recientemente. Los movimientos al alza se mostrarán aquí.";
    case "bajada":
      return "Nadie ha bajado puestos recientemente. Las caídas en el ranking aparecerán aquí.";
    case "todas":
      return "Aún no hay movimientos recientes. Cuando haya votos, subidas, bajadas o novedades del torneo, aparecerán aquí.";
  }
}
