import { isValidRankVotePair } from "@/features/rankings/lib/ranker-name";

export const ENTRY_VOTE_CANDIDATES = ["franbv", "nilojeda"] as const;
export type EntryVoteCandidate = (typeof ENTRY_VOTE_CANDIDATES)[number];

export function isValidEntryVoteCandidate(id: string): id is EntryVoteCandidate {
  return (ENTRY_VOTE_CANDIDATES as readonly string[]).includes(id);
}

export function resolveTorneoVotePath(
  state: Record<string, unknown>,
  matchId: string,
  candidateName: string,
): { ok: true; votePath: string } | { ok: false; reason: string } {
  const matches = state.matches as
    | Record<string, { p1?: string; p2?: string }>
    | undefined;
  const cuartosMatches = state.cuartosMatches as
    | Record<string, { p1?: string; p2?: string }>
    | undefined;
  const semisMatches = state.semisMatches as
    | Record<string, { p1?: string; p2?: string }>
    | undefined;
  const finalMatch = state.finalMatch as
    | { id?: string; p1?: string; p2?: string }
    | undefined;

  let match: { p1?: string; p2?: string } | undefined;
  let votePath: string;

  if (matches?.[matchId]) {
    match = matches[matchId];
    votePath = `torneo/state/matches/${matchId}/votes/${candidateName}`;
  } else if (cuartosMatches?.[matchId]) {
    match = cuartosMatches[matchId];
    votePath = `torneo/state/cuartosMatches/${matchId}/votes/${candidateName}`;
  } else if (semisMatches?.[matchId]) {
    match = semisMatches[matchId];
    votePath = `torneo/state/semisMatches/${matchId}/votes/${candidateName}`;
  } else if (finalMatch?.id === matchId) {
    match = finalMatch;
    votePath = `torneo/state/finalMatch/votes/${candidateName}`;
  } else {
    return { ok: false, reason: "match_not_found" };
  }

  const p1 = match.p1 ?? "";
  const p2 = match.p2 ?? "";
  if (candidateName !== p1 && candidateName !== p2) {
    return { ok: false, reason: "invalid_candidate" };
  }

  return { ok: true, votePath };
}

export function validateRankVoteCandidate(
  rv: { p1: string; p2: string },
  name: string,
): boolean {
  if (!isValidRankVotePair(rv)) return false;
  return name === rv.p1 || name === rv.p2;
}
