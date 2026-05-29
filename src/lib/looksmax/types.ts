/** Votación de ranking (rankvote/current) */
export type RankVoteRound = {
  id: string;
  p1: string;
  p2: string;
  votes: Record<string, number>;
  endTime: number;
  resolved?: boolean;
  resolving?: boolean;
};

export type RankVoteMyVote = {
  rvId: string;
  candidate: string;
};

/** Votación de entrada al ranking (entryVote/current) */
export type EntryVote = {
  id: string;
  votes: Record<string, number>;
  endTime: number;
  winner: string | null;
};

export type EntryVoteMyVote = {
  evId: string;
  candidate: string;
};

/** Posiciones override en Firebase (rankOverrides) */
export type RankOverrides = Record<string, number>;

/** Movimientos recientes por ranker (rankMovements) */
export type RankMovement = {
  dir: "up" | "down";
  delta: number;
  ts: number;
};

export type RankMovements = Record<string, RankMovement>;

/** Torneo */
export type TorneoPlayer = {
  name: string;
  photo: string;
  emoji: string;
};

export type TorneoMatchRound = "octavos" | "cuartos" | "semis" | "final";

export type TorneoMatch = {
  id: string;
  round: TorneoMatchRound;
  p1: string;
  p2: string;
  votes: Record<string, number>;
  winner: string | null;
  resolved: boolean;
};

export type TorneoPhase =
  | "waiting_octavos"
  | "octavos_voting"
  | "break_cuartos"
  | "cuartos_voting"
  | "semifinals_promo"
  | "semifinals_voting"
  | "break_final"
  | "final_voting"
  | "torneo_ended";

export type TorneoState = {
  phase: TorneoPhase;
  phaseStart?: number;
  phaseEnd: number;
  createdAt?: number;
  nextPhaseLabel?: string;
  matches?: Record<string, TorneoMatch>;
  cuartosMatches?: Record<string, TorneoMatch>;
  semisMatches?: Record<string, TorneoMatch>;
  finalMatch?: TorneoMatch;
  octavosWinners?: string[] | null;
  cuartosWinners?: string[] | null;
  semisWinners?: string[];
  champion?: string;
};

export type OctavosMatchDef = {
  id: string;
  p1: TorneoPlayer;
  p2: TorneoPlayer;
};
