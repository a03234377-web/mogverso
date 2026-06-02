"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import {
  AURA_GSAP_EASE,
  clearGsapTargets,
  prefersReducedMotion,
  runAfterPaint,
} from "@/lib/aura/gsap-motion";
import { cn } from "@/lib/cn";

type AuraLeadersGridProps = {
  ready: boolean;
  children: ReactNode;
  className?: string;
};

/** Grid Más/Menos Aura con entrada escalonada (GSAP). */
export function AuraLeadersGrid({ ready, children, className }: AuraLeadersGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!ready || playedRef.current) return;

    let cards: HTMLElement[] = [];
    let cancelled = false;

    const cancelPaint = runAfterPaint(() => {
      if (cancelled || playedRef.current) return;

      const grid = gridRef.current;
      if (!grid) return;

      cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-aura-leader-card]"));
      if (cards.length === 0) return;

      playedRef.current = true;

      if (prefersReducedMotion()) return;

      gsap.set(cards, { opacity: 0, y: 18 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.48,
        stagger: 0.1,
        ease: AURA_GSAP_EASE,
        clearProps: "transform,opacity",
      });
    });

    return () => {
      cancelled = true;
      cancelPaint();
      if (cards.length > 0) {
        clearGsapTargets(cards);
      }
    };
  }, [ready]);

  return (
    <div ref={gridRef} className={cn(className)}>
      {children}
    </div>
  );
}
