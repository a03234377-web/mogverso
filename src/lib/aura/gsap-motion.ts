import gsap from "gsap";

/** Preferencias compartidas para animaciones GSAP en /aura. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const AURA_GSAP_EASE = "power2.out";
export const AURA_GSAP_EASE_IN = "power2.in";

const GSAP_CLEAR_PROPS = "opacity,transform,scale,rotate,x,y";

/** Ejecuta tras dos frames (dialog montado, layout estable). */
export function runAfterPaint(callback: () => void): () => void {
  let cancelled = false;
  let outerId = 0;
  let innerId = 0;

  outerId = requestAnimationFrame(() => {
    innerId = requestAnimationFrame(() => {
      if (!cancelled) callback();
    });
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(outerId);
    cancelAnimationFrame(innerId);
  };
}

export function clearGsapTargets(
  targets: gsap.TweenTarget | gsap.TweenTarget[] | null | undefined,
): void {
  if (!targets) return;
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: GSAP_CLEAR_PROPS });
}
