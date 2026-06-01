export type AuraScores = Record<string, number>;

export type AuraMeta = {
  weekId: string;
  monthId: string;
};

export type AuraVoteKind = "boost" | "penalty";

export type AuraWeekVoteEntry = {
  kind: AuraVoteKind;
  ts: number;
  delta: number;
};

/** Papeleta semanal en RTDB (`auraDeviceWeek/*`, `auraIpWeek/*`). */
export type AuraDeviceWeek = {
  used: number;
  byName?: Record<string, AuraWeekVoteEntry>;
  /** Legacy: último voto (se migra al leer con `parseAuraWeekBallot`). */
  name?: string;
  kind?: AuraVoteKind;
  ts?: number;
  delta?: number;
};
