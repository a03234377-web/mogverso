"use client";

import { useCallback, useEffect, useState } from "react";

const SCROLL_RANGE_PX = 100;

function readScrollState() {
  if (typeof window === "undefined") {
    return { headerOpacity: 0, logoOpacity: 0 };
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 768px)").matches;

  if (prefersReduced || !desktop) {
    return { headerOpacity: 1, logoOpacity: 1 };
  }

  const progress = Math.min(window.scrollY / SCROLL_RANGE_PX, 1);
  return { headerOpacity: progress, logoOpacity: progress };
}

export function useHeaderScroll() {
  const [headerOpacity, setHeaderOpacity] = useState(
    () => readScrollState().headerOpacity,
  );
  const [logoOpacity, setLogoOpacity] = useState(() => readScrollState().logoOpacity);

  const handleScroll = useCallback(() => {
    const next = readScrollState();
    setHeaderOpacity(next.headerOpacity);
    setLogoOpacity(next.logoOpacity);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionMq.addEventListener("change", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      motionMq.removeEventListener("change", handleScroll);
    };
  }, [handleScroll]);

  const isLogoInteractive = logoOpacity > 0.05;

  return { headerOpacity, logoOpacity, isLogoInteractive };
}
