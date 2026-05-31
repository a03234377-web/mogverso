import { RANKERS, type Ranker } from "@/features/rankings/data/rankers";

export function getRankedNamesFromOverrides(
  overrides: Record<string, number>,
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
