"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { AURA_GSAP_EASE, prefersReducedMotion } from "@/lib/aura/gsap-motion";
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

  useLayoutEffect(() => {
    if (!ready || playedRef.current) return;
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-aura-leader-card]");
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
      clearProps: "transform",
    });
  }, [ready]);

  return (
    <div ref={gridRef} className={cn(className)}>
      {children}
    </div>
  );
}
