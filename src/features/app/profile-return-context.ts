"use client";

import { rankerProfileSlug } from "@/features/rankings/lib/profile-slug";
import type { NavPageId } from "@/features/app/routes";

export const PROFILE_RETURN_STORAGE_KEY = "mogverso:profile-return";
const PROFILE_RETURN_MAX_AGE_MS = 10 * 60 * 1000;

export type ProfileReturnContext = {
  from: NavPageId;
  scrollY: number;
  target: string | null;
  ts: number;
};

export function normalizeProfileTarget(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return rankerProfileSlug(value);
}

export function saveProfileReturnContext(
  from: NavPageId,
  target: string | null | undefined,
): void {
  if (typeof window === "undefined") return;
  const payload: ProfileReturnContext = {
    from,
    scrollY: Math.max(0, Math.round(window.scrollY)),
    target: normalizeProfileTarget(target),
    ts: Date.now(),
  };
  window.sessionStorage.setItem(PROFILE_RETURN_STORAGE_KEY, JSON.stringify(payload));
}

export function readProfileReturnContext(): ProfileReturnContext | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PROFILE_RETURN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProfileReturnContext;
    if (!parsed || typeof parsed !== "object") return null;
    if (
      typeof parsed.ts !== "number" ||
      Date.now() - parsed.ts > PROFILE_RETURN_MAX_AGE_MS
    ) {
      clearProfileReturnContext();
      return null;
    }
    if (typeof parsed.from !== "string") return null;
    return {
      from: parsed.from,
      scrollY: typeof parsed.scrollY === "number" ? parsed.scrollY : 0,
      target: normalizeProfileTarget(parsed.target),
      ts: parsed.ts,
    };
  } catch {
    return null;
  }
}

export function clearProfileReturnContext(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_RETURN_STORAGE_KEY);
}
