"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { AuraScoreBadge } from "@/features/aura/components/AuraScoreBadge";
import { AURA_GSAP_EASE, prefersReducedMotion } from "@/lib/aura/gsap-motion";

type LeaderAuraScoreProps = {
  aura: number;
};

/** Badge de aura en líderes con pop GSAP al cambiar puntuación. */
export function LeaderAuraScore({ aura }: LeaderAuraScoreProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const prevAuraRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prev = prevAuraRef.current;
    prevAuraRef.current = aura;

    if (prev === null || prev === aura || prefersReducedMotion()) return;

    gsap.killTweensOf(wrap);
    gsap.fromTo(
      wrap,
      { scale: 1.18, y: aura > prev ? -3 : 3 },
      {
        scale: 1,
        y: 0,
        duration: 0.38,
        ease: AURA_GSAP_EASE,
        clearProps: "transform",
      },
    );
  }, [aura]);

  return (
    <div ref={wrapRef} className="shrink-0">
      <AuraScoreBadge total={aura} />
    </div>
  );
}
