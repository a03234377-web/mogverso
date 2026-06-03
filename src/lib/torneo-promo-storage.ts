const STORAGE_KEY = "torneo_promo_dismissed_v1";

export function hasSeenTorneoPromo(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTorneoPromoSeen(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}
