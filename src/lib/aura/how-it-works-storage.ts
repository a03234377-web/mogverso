const STORAGE_KEY = "mogverso:aura-how-it-works-dismiss";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

function readCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((part) => part === `${STORAGE_KEY}=1`);
}

export function hasSeenAuraHowItWorks(): boolean {
  if (typeof window === "undefined") return true;
  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {
    /* quota / private mode */
  }
  return readCookie();
}

export function markAuraHowItWorksSeen(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* quota / private mode */
  }
  if (typeof document !== "undefined") {
    document.cookie = `${STORAGE_KEY}=1; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  }
}
