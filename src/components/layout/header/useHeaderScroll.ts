"use client";

import { useEffect, useState } from "react";

const SCROLL_RANGE_PX = 100;

function readScrollState(disableFade: boolean) {
  if (typeof window === "undefined") {
    return { headerOpacity: 0, logoOpacity: 0 };
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 768px)").matches;

  if (prefersReduced || !desktop || disableFade) {
    return { headerOpacity: 1, logoOpacity: 1 };
  }

  const progress = Math.min(window.scrollY / SCROLL_RANGE_PX, 1);
  return { headerOpacity: progress, logoOpacity: progress };
}

export function useHeaderScroll(disableFade = false) {
  const [headerOpacity, setHeaderOpacity] = useState(
    () => readScrollState(disableFade).headerOpacity,
  );
  const [logoOpacity, setLogoOpacity] = useState(
    () => readScrollState(disableFade).logoOpacity,
  );

  useEffect(() => {
    const sync = () => {
      const next = readScrollState(disableFade);
      setHeaderOpacity(next.headerOpacity);
      setLogoOpacity(next.logoOpacity);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionMq.addEventListener("change", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      motionMq.removeEventListener("change", sync);
    };
  }, [disableFade]);

  const isLogoInteractive = logoOpacity > 0.05;

  return { headerOpacity, logoOpacity, isLogoInteractive };
}
