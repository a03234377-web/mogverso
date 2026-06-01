import { resolveCanonicalRankerName } from "@/features/rankings/data/ranker-aliases";
import type { AuraWeekVoteEntry } from "@/types/aura";

export type { AuraWeekVoteEntry };

/** Cupo semanal: hasta 10 candidatos distintos, 1 voto por candidato. */
export type AuraWeekBallot = {
  used: number;
  byName: Record<string, AuraWeekVoteEntry>;
};

const emptyBallot = (): AuraWeekBallot => ({ used: 0, byName: {} });

function parseVoteEntry(raw: unknown): AuraWeekVoteEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const kind = o.kind === "penalty" ? "penalty" : o.kind === "boost" ? "boost" : null;
  if (!kind) return null;
  return {
    kind,
    ts: typeof o.ts === "number" ? o.ts : Date.now(),
    delta: typeof o.delta === "number" ? o.delta : 0,
  };
}

/** Lee papeleta semanal (soporta formato legacy con un solo `name`). */
export function parseAuraWeekBallot(raw: unknown): AuraWeekBallot {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyBallot();
  }

  const o = raw as Record<string, unknown>;
  const byName: Record<string, AuraWeekVoteEntry> = {};

  if (o.byName && typeof o.byName === "object" && !Array.isArray(o.byName)) {
    for (const [key, value] of Object.entries(o.byName as Record<string, unknown>)) {
      const entry = parseVoteEntry(value);
      if (entry) byName[resolveCanonicalRankerName(key)] = entry;
    }
  }

  if (typeof o.name === "string" && o.name.trim()) {
    const canon = resolveCanonicalRankerName(o.name);
    if (!byName[canon]) {
      const legacy = parseVoteEntry({
        kind: o.kind,
        ts: o.ts,
        delta: o.delta,
      });
      if (legacy) byName[canon] = legacy;
    }
  }

  const keyCount = Object.keys(byName).length;
  const usedField =
    typeof o.used === "number" && Number.isFinite(o.used) ? Math.trunc(o.used) : 0;

  return {
    used: Math.max(usedField, keyCount),
    byName,
  };
}

export function mergeAuraWeekBallots(
  a: AuraWeekBallot,
  b: AuraWeekBallot,
): AuraWeekBallot {
  const byName = { ...a.byName };
  for (const [key, entry] of Object.entries(b.byName)) {
    if (!byName[key]) byName[key] = entry;
  }
  return {
    used: Math.max(a.used, b.used, Object.keys(byName).length),
    byName,
  };
}

export function hasAuraVoteFor(ballot: AuraWeekBallot, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    ballot.byName,
    resolveCanonicalRankerName(name),
  );
}

export function ballotVotedNames(ballot: AuraWeekBallot): string[] {
  return Object.keys(ballot.byName);
}
