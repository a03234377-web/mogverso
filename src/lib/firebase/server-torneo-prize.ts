import { RANKERS } from "@/features/rankings/data/rankers";
import {
  computeRankedAfterChampionBoost,
  TORNEO_CHAMPION_RANK_BOOST,
} from "@/lib/torneo-champion-prize";
import { getRankedNamesFromOverrides } from "@/lib/firebase/rank-overrides";
import { getAdminDatabase } from "./admin";

export async function applyTorneoChampionPrize(champion: string): Promise<boolean> {
  const db = getAdminDatabase();
  const ovSnap = await db.ref("rankOverrides").get();
  const overrides = ovSnap.exists() ? (ovSnap.val() as Record<string, number>) : {};

  const ranked = getRankedNamesFromOverrides(overrides, RANKERS);
  const { newRanked, delta } = computeRankedAfterChampionBoost(
    ranked,
    champion,
    TORNEO_CHAMPION_RANK_BOOST,
  );

  if (delta === 0 && ranked.indexOf(champion) === -1) return false;

  const newOverrides: Record<string, number> = {};
  newRanked.forEach((name, idx) => {
    newOverrides[name] = idx;
  });

  const tsNow = Date.now();
  const batch: Record<string, unknown> = { rankOverrides: newOverrides };

  if (delta > 0) {
    const [movSnap, upSnap] = await Promise.all([
      db.ref("rankMovements").get(),
      db.ref("rankMovementsUp").get(),
    ]);
    const movements = movSnap.exists()
      ? (movSnap.val() as Record<string, unknown>)
      : {};
    movements[champion] = { dir: "up", delta, ts: tsNow };
    batch.rankMovements = movements;

    const up = upSnap.exists() ? Number(upSnap.val()) : 0;
    batch.rankMovementsUp = up + delta;
  }

  await db.ref().update(batch);
  return true;
}
