"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, type RefObject } from "react";

const FLIP_DURATION = 0.52;
const FLIP_EASE = "power2.out";
const MIN_DELTA_PX = 2;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type FlipListOptions = {
  /** Selector for each animated row inside the container. */
  itemSelector?: string;
  enabled?: boolean;
};

/**
 * FLIP: anima filas cuando cambia el orden en un contenedor flex/column.
 * Pasar una `orderKey` que cambie solo cuando el orden (o ranks mostrados) cambie.
 */
export function useFlipListAnimation(
  containerRef: RefObject<HTMLElement | null>,
  orderKey: string,
  { itemSelector = "[data-flip-id]", enabled = true }: FlipListOptions = {},
) {
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());
  const skipNextRef = useRef(true);
  const tweensRef = useRef(new WeakMap<HTMLElement, gsap.core.Tween>());

  useLayoutEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>(itemSelector);
    const nextPositions = new Map<string, DOMRect>();

    elements.forEach((el) => {
      const id = el.dataset.flipId;
      if (!id) return;
      nextPositions.set(id, el.getBoundingClientRect());
    });

    if (skipNextRef.current) {
      skipNextRef.current = false;
      positionsRef.current = nextPositions;
      return;
    }

    const reduced = prefersReducedMotion();

    nextPositions.forEach((nextRect, id) => {
      const prevRect = positionsRef.current.get(id);
      if (!prevRect || reduced) return;

      const dy = prevRect.top - nextRect.top;
      const dx = prevRect.left - nextRect.left;
      if (Math.abs(dy) < MIN_DELTA_PX && Math.abs(dx) < MIN_DELTA_PX) return;

      const el = container.querySelector<HTMLElement>(
        `${itemSelector}[data-flip-id="${CSS.escape(id)}"]`,
      );
      if (!el) return;

      tweensRef.current.get(el)?.kill();
      gsap.killTweensOf(el);

      const tween = gsap.fromTo(
        el,
        { y: dy, x: dx, zIndex: 2 },
        {
          y: 0,
          x: 0,
          duration: FLIP_DURATION,
          ease: FLIP_EASE,
          overwrite: true,
          onComplete: () => {
            gsap.set(el, { clearProps: "transform,zIndex" });
          },
        },
      );
      tweensRef.current.set(el, tween);
    });

    positionsRef.current = nextPositions;
  }, [containerRef, orderKey, enabled, itemSelector]);
}
