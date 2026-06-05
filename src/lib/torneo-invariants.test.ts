import { describe, expect, it } from "vitest";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { getTorneoMatchesView } from "@/features/torneo/lib/torneo-matches-view";
import { getCuartosWinnersForBracket } from "@/lib/torneo-bracket";
import { validateTorneoVoteContext } from "@/lib/firebase/validate-vote";
import { buildOctavosToCuartosState } from "@/lib/torneo-phase-transition";
import {
  getEditionStartMsForWeekContaining,
  getTorneoVotingCanonicalEndMs,
  isTorneoPhaseExpired,
  isTorneoVotingPhaseExpired,
} from "@/lib/torneo-schedule";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";

function octMatch(
  id: string,
  p1: string,
  p2: string,
  votes: [number, number],
): TorneoMatch {
  return {
    id,
    round: "octavos",
    p1,
    p2,
    votes: { [p1]: votes[0], [p2]: votes[1] },
    winner: null,
    resolved: false,
  };
}

function cuaMatch(id: string, p1: string, p2: string): TorneoMatch {
  return {
    id,
    round: "cuartos",
    p1,
    p2,
    votes: { _placeholder_: 0 },
    winner: null,
    resolved: false,
  };
}

describe("torneo phase invariants", () => {
  it("expires voting when canonical close passed but RTDB phaseEnd is still in the future", () => {
    const editionStartMs = 1_700_000_000_000;
    const canonical = getTorneoVotingCanonicalEndMs(
      {
        phase: PHASES.OCTAVOS_VOTING,
        editionStartMs,
      },
      editionStartMs + 86_400_000,
    );
    expect(canonical).not.toBeNull();

    const state = {
      phase: PHASES.OCTAVOS_VOTING,
      phaseEnd: Date.now() + 86_400_000 * 2,
      editionStartMs,
    };
    const now = (canonical ?? 0) + 5_000;

    expect(isTorneoVotingPhaseExpired(state, now)).toBe(true);
    expect(isTorneoPhaseExpired(state, now)).toBe(true);
  });

  it("keeps voting open when RTDB phaseEnd is stale but canonical close is still in the future", () => {
    const now = Date.UTC(2026, 5, 5, 14, 0, 0);
    const editionStartMs = getEditionStartMsForWeekContaining(now);
    const canonical = getTorneoVotingCanonicalEndMs(
      { phase: PHASES.CUARTOS_VOTING, editionStartMs },
      now,
    );
    expect(canonical).not.toBeNull();
    expect(canonical!).toBeGreaterThan(now + 3_600_000);

    const state = {
      phase: PHASES.CUARTOS_VOTING,
      phaseEnd: now - 86_400_000,
      editionStartMs,
    };

    expect(isTorneoVotingPhaseExpired(state, now)).toBe(false);
    expect(isTorneoPhaseExpired(state, now)).toBe(false);
    expect(validateTorneoVoteContext(state, "cua_0", now)).toEqual({ ok: true });
  });

  it("allows cuartos votes during legacy break when schedule milestone is active", () => {
    const now = Date.UTC(2026, 5, 5, 14, 0, 0);
    const editionStartMs = getEditionStartMsForWeekContaining(now);
    const canonical = getTorneoVotingCanonicalEndMs(
      { phase: PHASES.CUARTOS_VOTING, editionStartMs },
      now,
    );
    expect(canonical).not.toBeNull();
    expect(canonical!).toBeGreaterThan(now);

    const state = {
      phase: PHASES.BREAK_CUARTOS,
      phaseEnd: now - 60_000,
      editionStartMs,
      cuartosMatches: {
        cua_0: cuaMatch("cua_0", "RubenMaxxing", "TitoChape"),
      },
    };

    expect(validateTorneoVoteContext(state, "cua_0", now)).toEqual({ ok: true });
  });

  it("shows cuartos matches when phase is cuartos even if octavos matches remain", () => {
    const state: TorneoState = {
      phase: PHASES.CUARTOS_VOTING,
      phaseEnd: Date.now() + 60_000,
      matches: {
        oct_0: octMatch("oct_0", "A", "B", [10, 5]),
        oct_1: octMatch("oct_1", "C", "D", [8, 7]),
        oct_2: octMatch("oct_2", "E", "F", [6, 4]),
        oct_3: octMatch("oct_3", "G", "H", [9, 3]),
        oct_4: octMatch("oct_4", "I", "J", [5, 5]),
        oct_5: octMatch("oct_5", "K", "L", [7, 6]),
        oct_6: octMatch("oct_6", "M", "N", [4, 2]),
        oct_7: octMatch("oct_7", "O", "P", [11, 1]),
      },
      cuartosMatches: {
        cua_0: cuaMatch("cua_0", "A", "C"),
        cua_1: cuaMatch("cua_1", "E", "G"),
        cua_2: cuaMatch("cua_2", "I", "K"),
        cua_3: cuaMatch("cua_3", "M", "O"),
      },
    };

    const view = getTorneoMatchesView(state, null);
    expect(view?.round).toBe("cuartos");
    expect(view?.canVote).toBe(true);
    expect(view?.title).toContain("Cuartos");
  });

  it("does not preview semifinalists while cuartos duels are still open", () => {
    const state: TorneoState = {
      phase: PHASES.CUARTOS_VOTING,
      phaseEnd: Date.now() + 60_000,
      cuartosMatches: {
        cua_0: cuaMatch("cua_0", "RubenMaxxing", "TitoChape"),
        cua_1: cuaMatch("cua_1", "Kappah", "Ismael"),
        cua_2: cuaMatch("cua_2", "Giva", "Javichu"),
        cua_3: cuaMatch("cua_3", "JordiWild", "AlejandroAle"),
      },
    };

    const winners = getCuartosWinnersForBracket(state);
    expect(winners.filter(Boolean)).toHaveLength(0);
  });

  it("buildOctavosToCuartosState always includes cuartosMatches and ordered winners", () => {
    const state: TorneoState = {
      phase: PHASES.OCTAVOS_VOTING,
      phaseEnd: Date.now() + 60_000,
      matches: {
        oct_0: octMatch("oct_0", "RubenMaxxing", "SergiCabrer", [60, 43]),
        oct_1: octMatch("oct_1", "TitoChape", "Peereira7", [52, 43]),
        oct_2: octMatch("oct_2", "P1", "P2", [1, 0]),
        oct_3: octMatch("oct_3", "P3", "P4", [1, 0]),
        oct_4: octMatch("oct_4", "P5", "P6", [1, 0]),
        oct_5: octMatch("oct_5", "P7", "P8", [1, 0]),
        oct_6: octMatch("oct_6", "P9", "P10", [1, 0]),
        oct_7: octMatch("oct_7", "P11", "P12", [1, 0]),
      },
    };

    const now = Date.now();
    const next = buildOctavosToCuartosState(state, now);

    expect(next.phase).toBe(PHASES.CUARTOS_VOTING);
    expect(next.octavosWinners).toHaveLength(8);
    expect(next.octavosWinners?.[0]).toBe("RubenMaxxing");
    expect(next.octavosWinners?.[1]).toBe("TitoChape");
    expect(next.cuartosMatches?.cua_0.p1).toBe("RubenMaxxing");
    expect(next.cuartosMatches?.cua_0.p2).toBe("TitoChape");
    expect(next.phaseEnd).toBe(getTorneoVotingCanonicalEndMs(next, now));
  });
});
