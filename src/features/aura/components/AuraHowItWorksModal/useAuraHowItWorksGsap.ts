"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import {
  AURA_GSAP_EASE,
  prefersReducedMotion,
  runAfterPaint,
} from "@/lib/aura/gsap-motion";

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
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (!panel || prefersReducedMotion()) return;

    let cancelled = false;

    const cancelPaint = runAfterPaint(() => {
      if (cancelled) return;

      const icon = iconRef.current;
      const title = titleRef.current;
      const list = listRef.current;
      const cta = ctaRef.current;
      const items = list
        ? Array.from(list.querySelectorAll<HTMLElement>("[data-aura-how-item]"))
        : [];

      tlRef.current?.kill();
      gsap.set(panel, { opacity: 0, scale: 0.94, y: 20 });
      if (icon) gsap.set(icon, { opacity: 0, scale: 0.75 });
      if (title) gsap.set(title, { opacity: 0, y: 10 });
      if (items.length) gsap.set(items, { opacity: 0, y: 8 });
      if (cta) gsap.set(cta, { opacity: 0, y: 8 });

      const tl = gsap.timeline({
        defaults: { ease: AURA_GSAP_EASE },
        onComplete: () => {
          gsap.set([panel, icon, title, cta, ...items].filter(Boolean), {
            clearProps: "opacity,transform,scale",
          });
        },
      });
      tlRef.current = tl;

      tl.to(panel, { opacity: 1, scale: 1, y: 0, duration: 0.42 }, 0);

      if (icon) {
        tl.to(
          icon,
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" },
          0.06,
        );
      }

      if (title) {
        tl.to(title, { opacity: 1, y: 0, duration: 0.32 }, 0.1);
      }

      if (items.length) {
        tl.to(items, { opacity: 1, y: 0, duration: 0.3, stagger: 0.07 }, 0.16);
      }

      if (cta) {
        tl.to(cta, { opacity: 1, y: 0, duration: 0.28 }, 0.28);
      }
    });

    return () => {
      cancelled = true;
      cancelPaint();
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [open, panelRef, iconRef, titleRef, listRef, ctaRef]);
}
