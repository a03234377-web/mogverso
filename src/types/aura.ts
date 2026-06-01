export type AuraScores = Record<string, number>;

export type AuraMeta = {
  weekId: string;
  monthId: string;
};

export type AuraDeviceWeek = {
  used: number;
};

export type AuraVoteKind = "boost" | "penalty";
