import type { TorneoMatch, TorneoState } from "@/types/looksmax";

function findMatch(state: TorneoState, matchId: string): TorneoMatch | null {
  if (state.matches?.[matchId]) return state.matches[matchId];
  if (state.cuartosMatches?.[matchId]) return state.cuartosMatches[matchId];
  if (state.semisMatches?.[matchId]) return state.semisMatches[matchId];
  if (matchId === "final_0" && state.finalMatch) return state.finalMatch;
  return null;
}

export function patchTorneoVoteCount(
  state: TorneoState,
  matchId: string,
  candidateName: string,
): TorneoState {
  const next = structuredClone(state);
  const match = findMatch(next, matchId);
  if (!match) return state;

  match.votes = {
    ...match.votes,
    [candidateName]: (match.votes[candidateName] ?? 0) + 1,
  };
  return next;
}
