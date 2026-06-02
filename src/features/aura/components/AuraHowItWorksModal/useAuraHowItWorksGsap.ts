"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { AURA_GSAP_EASE, prefersReducedMotion } from "@/lib/aura/gsap-motion";

type AuraHowItWorksGsapTargets = {
  panelRef: RefObject<HTMLElement | null>;
  iconRef: RefObject<HTMLElement | null>;
  titleRef: RefObject<HTMLElement | null>;
  listRef: RefObject<HTMLElement | null>;
  ctaRef: RefObject<HTMLElement | null>;
};

export function useAuraHowItWorksGsap(
  open: boolean,
  targets: AuraHowItWorksGsapTargets,
) {
  const { panelRef, iconRef, titleRef, listRef, ctaRef } = targets;

  useLayoutEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const icon = iconRef.current;
    const title = titleRef.current;
    const list = listRef.current;
    const cta = ctaRef.current;
    if (!panel) return;

    if (prefersReducedMotion()) return;

    const items = list
      ? Array.from(list.querySelectorAll<HTMLElement>("[data-aura-how-item]"))
      : [];

    const ctx = gsap.context(() => {
      gsap.set(panel, { opacity: 0, scale: 0.92, y: 24 });
      if (icon) gsap.set(icon, { opacity: 0, scale: 0.6, rotate: -12 });
      if (title) gsap.set(title, { opacity: 0, y: 12 });
      if (items.length) gsap.set(items, { opacity: 0, x: -14 });
      if (cta) gsap.set(cta, { opacity: 0, y: 10 });

      const tl = gsap.timeline({ defaults: { ease: AURA_GSAP_EASE } });

      tl.to(panel, { opacity: 1, scale: 1, y: 0, duration: 0.5 }, 0);

      if (icon) {
        tl.to(
          icon,
          { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(1.6)" },
          0.08,
        );
      }

      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: 0.4 }, 0.14);
      }

      if (items.length) {
        tl.to(items, { opacity: 1, x: 0, duration: 0.38, stagger: 0.09 }, 0.22);
      }

      if (cta) {
        tl.to(cta, { opacity: 1, y: 0, duration: 0.35 }, 0.42);
      }
    }, panel);

    return () => ctx.revert();
  }, [open, panelRef, iconRef, titleRef, listRef, ctaRef]);
}
