import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";
import { MAX_MOVERS_STACK, MOVER_WINDOW_MS } from "@/lib/vote-intervals";
import type {
  MoverStack,
  MoverStackEntry,
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
  ts: number;
};

/** Convierte una pila de Firebase en lista ordenada (más reciente primero, máx. 5). */
export function parseMoverStack(
  stack: MoverStack | null | undefined,
  max = MAX_MOVERS_STACK,
): Mover[] {
  if (!stack) return [];
  return Object.values(stack)
    .filter((e) => e?.name && typeof e.ts === "number")
    .sort((a, b) => b.ts - a.ts)
    .slice(0, max)
    .map((e) => ({
      name: e.name,
      rank: e.rank,
      delta: e.delta,
      ts: e.ts,
    }));
}

/** Añade una entrada arriba y recorta la pila al máximo (FIFO: cae el más antiguo). */
export function prependMoverStack(
  stack: MoverStack | null | undefined,
  entry: MoverStackEntry,
  max = MAX_MOVERS_STACK,
): MoverStack {
  const list = parseMoverStack(stack, max);
  const next = [entry, ...list].slice(0, max);
  return Object.fromEntries(
    next.map((e) => [
      `${e.ts}_${e.name}`,
      { name: e.name, rank: e.rank, delta: e.delta, ts: e.ts },
    ]),
  );
}

/** Extrae movers desde pilas; si no hay pilas, usa rankMovements legacy. */
export function computeMovers(
  rankedNames: string[],
  movements: RankMovements | null | undefined,
  stacks?: {
    up?: MoverStack | null;
    down?: MoverStack | null;
  },
  windowMs = MOVER_WINDOW_MS,
  now = Date.now(),
): { upMovers: Mover[]; downMovers: Mover[] } {
  const upFromStack = parseMoverStack(stacks?.up ?? null);
  const downFromStack = parseMoverStack(stacks?.down ?? null);
  if (upFromStack.length > 0 || downFromStack.length > 0) {
    return { upMovers: upFromStack, downMovers: downFromStack };
  }

  const cutoff = now - windowMs;
  const upMovers: Mover[] = [];
  const downMovers: Mover[] = [];

  rankedNames.forEach((name, i) => {
    const mov = movements?.[name];
    if (!mov || mov.ts <= cutoff) return;
    if (mov.dir === "up" && mov.delta > 0) {
      upMovers.push({ name, rank: i + 1, delta: mov.delta, ts: mov.ts });
    }
    if (mov.dir === "down" && mov.delta > 0) {
      downMovers.push({ name, rank: i + 1, delta: mov.delta, ts: mov.ts });
    }
  });

  upMovers.sort((a, b) => b.delta - a.delta || b.ts - a.ts);
  downMovers.sort((a, b) => b.ts - a.ts || b.delta - a.delta);

  return {
    upMovers: upMovers.slice(0, MAX_MOVERS_STACK),
    downMovers: downMovers.slice(0, MAX_MOVERS_STACK),
  };
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
  windowMs = MOVER_WINDOW_MS,
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
