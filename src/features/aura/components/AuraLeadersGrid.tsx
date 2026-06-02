"use client";

import { useRef, type ReactNode } from "react";
import { useGsapStaggerEntrance } from "@/features/aura/hooks/useGsapStaggerEntrance";
import { cn } from "@/lib/cn";

type AuraLeadersGridProps = {
  ready: boolean;
  children: ReactNode;
  className?: string;
};

/** Grid Más/Menos Aura con entrada escalonada (GSAP). */
export function AuraLeadersGrid({ ready, children, className }: AuraLeadersGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGsapStaggerEntrance(gridRef, ready, {
    itemSelector: "[data-aura-leader-card]",
    y: 20,
    duration: 0.45,
    staggerAmount: 0.14,
  });

  return (
    <div ref={gridRef} className={cn(className)}>
      {children}
    </div>
  );
}
