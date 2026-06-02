const STORAGE_KEY = "mogverso:aura-how-it-works-seen";

export function hasSeenAuraHowItWorks(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markAuraHowItWorksSeen(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}
