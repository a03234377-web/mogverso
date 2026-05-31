import type { IconName } from "@/types/icons";

export type NoticiaEventCategory = "ascension" | "ranking" | "comunidad" | "drama";

/** Tipo de evento para filtrar el feed de noticias. */
export type NoticiaEventKind = "rankvote" | "subida" | "bajada" | "torneo";

export type NoticiaEvent = {
  id: string;
  ts: number;
  kind: NoticiaEventKind;
  cat: NoticiaEventCategory;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
  /** Nombres de rankers a enlazar al perfil dentro de title/body. */
  profileNames: string[];
};

export type RankVoteHistoryRow = {
  id?: string;
  winner: string;
  loser: string;
  wVotes: number;
  lVotes: number;
  ts: number;
  winnerPos?: number;
  loserPos?: number;
  winnerNewPos?: number;
  loserNewPos?: number;
};
