"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import {
  AURA_GSAP_EASE,
  prefersReducedMotion,
  runAfterPaint,
} from "@/lib/aura/gsap-motion";

type GsapStaggerEntranceOptions = {
  itemSelector: string;
  y?: number;
  duration?: number;
  /** Tiempo total del escalonado (no crece con N filas). */
  staggerAmount?: number;
};

/**
 * Entrada en cascada al activarse `enabled` (p. ej. datos listos).
 * Una sola vez por montaje; respeta prefers-reduced-motion.
 */
export function useGsapStaggerEntrance(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  {
    itemSelector,
    y = 14,
    duration = 0.38,
    staggerAmount = 0.42,
  }: GsapStaggerEntranceOptions,
) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!enabled || playedRef.current) return;

    let items: HTMLElement[] = [];
    let cancelled = false;
    let tween: gsap.core.Tween | null = null;

    const cancelPaint = runAfterPaint(() => {
      if (cancelled || playedRef.current) return;

      const root = containerRef.current;
      if (!root) return;

      items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
      if (items.length === 0) return;

      playedRef.current = true;

      if (prefersReducedMotion()) return;

      gsap.set(items, { opacity: 0, y });
      tween = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration,
        stagger: { amount: staggerAmount, from: "start" },
        ease: AURA_GSAP_EASE,
        clearProps: "transform,opacity",
      });
    });

    return () => {
      cancelled = true;
      cancelPaint();
      tween?.kill();
      if (!playedRef.current && items.length > 0) {
        gsap.set(items, { clearProps: "opacity,transform" });
      }
    };
  }, [enabled, containerRef, itemSelector, y, duration, staggerAmount]);
}
