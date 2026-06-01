"use client";

import { getMadridWeekId } from "@/lib/aura/periods";
import { parseAuraWeekBallot, type AuraWeekBallot } from "@/lib/aura/week-ballot";

const STORAGE_PREFIX = "lm_aura_ballot_";

type StoredAuraBallot = {
  weekId: string;
  votedNames: string[];
  used: number;
};

export function readStoredAuraBallot(weekId = getMadridWeekId()): AuraWeekBallot {
  if (typeof window === "undefined") return parseAuraWeekBallot(null);

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${weekId}`);
    if (!raw) return parseAuraWeekBallot(null);
    const parsed = JSON.parse(raw) as StoredAuraBallot;
    if (parsed.weekId !== weekId || !Array.isArray(parsed.votedNames)) {
      return parseAuraWeekBallot(null);
    }
    const byName: AuraWeekBallot["byName"] = {};
    for (const name of parsed.votedNames) {
      byName[name] = { kind: "boost", ts: 0, delta: 0 };
    }
    return {
      used: Math.max(parsed.used ?? 0, parsed.votedNames.length),
      byName,
    };
  } catch {
    return parseAuraWeekBallot(null);
  }
}

export function writeStoredAuraBallot(weekId: string, ballot: AuraWeekBallot): void {
  if (typeof window === "undefined") return;
  const votedNames = Object.keys(ballot.byName);
  if (votedNames.length === 0 && ballot.used === 0) {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${weekId}`);
    } catch {
      /* ignore */
    }
    return;
  }

  const payload: StoredAuraBallot = {
    weekId,
    votedNames,
    used: Math.max(ballot.used, votedNames.length),
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${weekId}`, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}
