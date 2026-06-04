import { PHASES } from "@/features/torneo/data/torneo-players";
import { isValidRankVotePair } from "@/features/rankings/lib/ranker-name";
import {
  getTorneoVotingCanonicalEndMs,
  isTorneoLegacyBreakReadyToOpen,
} from "@/lib/torneo-schedule";
import type { TorneoPhase } from "@/types/looksmax";

const OCTAVOS_PREFIX = "oct_";
const CUARTOS_PREFIX = "cua_";
const SEMIS_PREFIX = "semi_";

function expectedPhaseForMatchId(matchId: string): TorneoPhase | null {
  if (matchId.startsWith(OCTAVOS_PREFIX)) return PHASES.OCTAVOS_VOTING;
  if (matchId.startsWith(CUARTOS_PREFIX)) return PHASES.CUARTOS_VOTING;
  if (matchId.startsWith(SEMIS_PREFIX)) return PHASES.SEMIFINALS_VOTING;
  if (matchId === "final_0") return PHASES.FINAL_VOTING;
  return null;
}

export function validateTorneoVoteContext(
  state: Record<string, unknown>,
  matchId: string,
  now = Date.now(),
): { ok: true } | { ok: false; reason: string } {
  const phase = state.phase as TorneoPhase | undefined;
  const phaseEnd = typeof state.phaseEnd === "number" ? state.phaseEnd : 0;
  const editionStartMs =
    typeof state.editionStartMs === "number" ? state.editionStartMs : undefined;
  const expected = expectedPhaseForMatchId(matchId);

  if (!expected) return { ok: false, reason: "invalid_match_id" };

  const legacyBreakOk =
    phase != null &&
    isTorneoLegacyBreakReadyToOpen({ phase, editionStartMs }, now) &&
    ((phase === PHASES.BREAK_CUARTOS && expected === PHASES.CUARTOS_VOTING) ||
      (phase === PHASES.SEMIFINALS_PROMO && expected === PHASES.SEMIFINALS_VOTING));

  if (phase !== expected && !legacyBreakOk) {
    return { ok: false, reason: "wrong_phase" };
  }

  const phaseForEnd = legacyBreakOk && expected != null ? expected : phase;
  const canonicalEnd =
    phaseForEnd != null
      ? getTorneoVotingCanonicalEndMs({ phase: phaseForEnd, editionStartMs }, now)
      : null;
  const effectiveEnd =
    canonicalEnd != null ? Math.min(phaseEnd, canonicalEnd) : phaseEnd;
  if (now >= effectiveEnd - 2000) return { ok: false, reason: "phase_ended" };

  const matches = state.matches as Record<string, { resolved?: boolean }> | undefined;
  const cuartos = state.cuartosMatches as
    | Record<string, { resolved?: boolean }>
    | undefined;
  const semis = state.semisMatches as
    | Record<string, { resolved?: boolean }>
    | undefined;
  const finalMatch = state.finalMatch as { resolved?: boolean } | undefined;

  let resolved = false;
  if (matches?.[matchId]) resolved = Boolean(matches[matchId].resolved);
  else if (cuartos?.[matchId]) resolved = Boolean(cuartos[matchId].resolved);
  else if (semis?.[matchId]) resolved = Boolean(semis[matchId].resolved);
  else if (matchId === "final_0" && finalMatch) resolved = Boolean(finalMatch.resolved);

  if (resolved) return { ok: false, reason: "match_resolved" };

  return { ok: true };
}

const ENTRY_VOTE_CANDIDATES = ["franbv", "nilojeda"] as const;
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
    | Record<string, { p1?: string; p2?: string; resolved?: boolean }>
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
