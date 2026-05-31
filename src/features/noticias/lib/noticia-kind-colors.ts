import type { NoticiaEventKind } from "./noticia-event";

/** Color de la etiqueta superior (catLabel), según tipo de evento. */
export function noticiaKindLabelClass(kind: NoticiaEventKind): string {
  switch (kind) {
    case "rankvote":
      return "text-lm-gold";
    case "bajada":
      return "text-lm-red2";
    case "subida":
      return "text-lm-green2";
    case "torneo":
      return "text-lm-purple";
  }
}
