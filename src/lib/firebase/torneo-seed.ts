import { RANKERS } from "@/features/rankings/data/rankers";
import { getRankedNamesFromOverrides } from "@/features/rankings/lib/ranking";
import { previewOctavosPairings } from "@/lib/torneo-bracket";
import { getAdminDatabase } from "./admin";

export const TORNEO_SEED_SIZE = 16;

export { previewOctavosPairings };

export async function fetchTorneoSeedNames(): Promise<string[]> {
  const db = getAdminDatabase();
  const overridesSnap = await db.ref("rankOverrides").get();
  const overrides = overridesSnap.exists()
    ? (overridesSnap.val() as Record<string, number>)
    : {};
  const ranked = getRankedNamesFromOverrides(overrides, RANKERS);
  const seed = ranked.slice(0, TORNEO_SEED_SIZE);

  if (seed.length >= TORNEO_SEED_SIZE) return seed;

  const base = RANKERS.map((r) => r.name);
  const merged = [...seed];
  for (const name of base) {
    if (merged.length >= TORNEO_SEED_SIZE) break;
    if (!merged.includes(name)) merged.push(name);
  }

  if (merged.length < TORNEO_SEED_SIZE) {
    console.warn(
      `[torneo-seed] Only ${merged.length} names available; need ${TORNEO_SEED_SIZE}`,
    );
  }

  return merged.slice(0, TORNEO_SEED_SIZE);
}
