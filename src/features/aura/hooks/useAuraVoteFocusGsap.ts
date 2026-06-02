"use client";

import gsap from "gsap";
import { useLayoutEffect, type RefObject } from "react";
import { AURA_GSAP_EASE, prefersReducedMotion } from "@/lib/aura/gsap-motion";

/** Pulso GSAP al enfocar fila de voto desde perfil (`?target=`). */
export function useAuraVoteFocusGsap(
  cardRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el || !active || prefersReducedMotion()) return;

    gsap.killTweensOf(el);

    gsap.fromTo(
      el,
      { scale: 0.98, opacity: 0.92 },
      { scale: 1, opacity: 1, duration: 0.45, ease: AURA_GSAP_EASE },
    );

    const pulse = gsap.fromTo(
      el,
      {
        boxShadow: "0 0 0 0 rgba(232, 184, 75, 0.2), 0 0 16px rgba(232, 184, 75, 0.12)",
      },
      {
        boxShadow:
          "0 0 0 3px rgba(232, 184, 75, 0.35), 0 0 32px rgba(232, 184, 75, 0.32)",
        duration: 0.85,
        repeat: 3,
        yoyo: true,
        ease: "sine.inOut",
      },
    );

    return () => {
      pulse.kill();
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "boxShadow,transform,opacity" });
    };
  }, [active, cardRef]);
}
