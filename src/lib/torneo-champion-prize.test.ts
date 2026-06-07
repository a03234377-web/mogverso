import { describe, expect, it } from "vitest";
import {
  computeRankedAfterChampionBoost,
  resolveTorneoChampionFromFinal,
  TORNEO_CHAMPION_RANK_BOOST,
} from "@/lib/torneo-champion-prize";
import type { TorneoMatch } from "@/types/looksmax";

describe("torneo champion prize", () => {
  it("resolves champion from final votes", () => {
    const finalMatch: TorneoMatch = {
      id: "final_0",
      round: "final",
      p1: "TitoChape",
      p2: "JordiWild",
      votes: { TitoChape: 164, JordiWild: 150 },
      winner: null,
      resolved: false,
    };

    expect(resolveTorneoChampionFromFinal(finalMatch)).toEqual({
      champion: "TitoChape",
      championVotes: 164,
      runnerUp: "JordiWild",
      runnerUpVotes: 150,
    });
  });

  it("boosts champion five ranking slots", () => {
    const ranked = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const { newRanked, delta } = computeRankedAfterChampionBoost(
      ranked,
      "G",
      TORNEO_CHAMPION_RANK_BOOST,
    );

    expect(newRanked.indexOf("G")).toBe(1);
    expect(delta).toBe(5);
  });
});
