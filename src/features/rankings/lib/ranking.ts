import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";
import type {
  RankMovement,
  RankMovements,
  RankOverrides,
} from "@/features/shared/lib/types";

/** Ordena nombres según overrides de Firebase; sin overrides usa el orden base de RANKERS. */
export function getRankedNamesFromOverrides(
  overrides: RankOverrides,
  rankers: Ranker[] = RANKERS,
): string[] {
  const names = rankers.map((r) => r.name);
  if (!overrides || Object.keys(overrides).length === 0) return [...names];
  return [...names]
    .map((n, i) => ({
      name: n,
      pos: overrides[n] !== undefined ? Number(overrides[n]) : i,
    }))
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.name);
}

export type Mover = {
  name: string;
  rank: number;
  delta: number;
};

const DEFAULT_MOVER_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Extrae movers recientes (subidas/bajadas) a partir del ranking y movements. */
export function computeMovers(
  rankedNames: string[],
  movements: RankMovements | null | undefined,
  windowMs = DEFAULT_MOVER_WINDOW_MS,
  now = Date.now(),
): { upMovers: Mover[]; downMovers: Mover[] } {
  const cutoff = now - windowMs;
  const upMovers: Mover[] = [];
  const downMovers: Mover[] = [];

  rankedNames.forEach((name, i) => {
    const mov = movements?.[name];
    if (!mov || mov.ts <= cutoff) return;
    if (mov.dir === "up" && mov.delta > 0) {
      upMovers.push({ name, rank: i + 1, delta: mov.delta });
    }
    if (mov.dir === "down" && mov.delta > 0) {
      downMovers.push({ name, rank: i + 1, delta: mov.delta });
    }
  });

  return { upMovers, downMovers };
}

export type RankedEntry = {
  name: string;
  rank: number;
  ranker: Ranker;
  originalIndex: number;
  movement: RankMovement | null;
};

/** Lista rankeada con datos del ranker y movimiento reciente (si aplica). */
export function buildRankedList(
  overrides: RankOverrides,
  movements: RankMovements | null | undefined,
  rankers: Ranker[] = RANKERS,
  windowMs = DEFAULT_MOVER_WINDOW_MS,
  now = Date.now(),
): RankedEntry[] {
  const rankedNames = getRankedNamesFromOverrides(overrides, rankers);
  const cutoff = now - windowMs;

  return rankedNames.flatMap((name, i) => {
    const ranker = rankers.find((r) => r.name === name);
    if (!ranker) return [];
    const mov = movements?.[name];
    const movement = mov && mov.ts > cutoff && mov.delta > 0 ? mov : null;
    return [
      {
        name,
        rank: i + 1,
        ranker,
        originalIndex: rankers.findIndex((r) => r.name === name),
        movement,
      },
    ];
  });
}
