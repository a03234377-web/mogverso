/** Preferencias compartidas para animaciones GSAP en /aura. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const AURA_GSAP_EASE = "power2.out";
export const AURA_GSAP_EASE_IN = "power2.in";
