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

/** Quita la papeleta en caché del navegador (p. ej. tras reset admin). */
export function clearStoredAuraBallot(weekId = getMadridWeekId()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${weekId}`);
  } catch {
    /* ignore */
  }
}

export function clearAllStoredAuraBallots(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Elimina papeletas de semanas distintas a la actual (residuos en localStorage). */
export function purgeStaleAuraBallots(currentWeekId = getMadridWeekId()): void {
  if (typeof window === "undefined") return;
  const keep = `${STORAGE_PREFIX}${currentWeekId}`;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key !== keep) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
