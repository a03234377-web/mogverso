"use client";

const STORAGE_PREFIX = "rankvoteVote_";

export function readStoredRankVote(roundId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${roundId}`);
  } catch {
    return null;
  }
}

export function writeStoredRankVote(roundId: string, candidate: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${roundId}`, candidate);
  } catch {
    /* storage bloqueado */
  }
}
