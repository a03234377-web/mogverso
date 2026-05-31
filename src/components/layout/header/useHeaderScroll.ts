"use client";

import { useEffect, useRef, useState } from "react";

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

  const handleScrollRef = useRef(() => {
    const next = readScrollState();
    setHeaderOpacity(next.headerOpacity);
    setLogoOpacity(next.logoOpacity);
  });

  useEffect(() => {
    handleScrollRef.current = () => {
      const next = readScrollState();
      setHeaderOpacity(next.headerOpacity);
      setLogoOpacity(next.logoOpacity);
    };
  });

  useEffect(() => {
    const onScroll = () => handleScrollRef.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionMq.addEventListener("change", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motionMq.removeEventListener("change", onScroll);
    };
  }, []);

  const isLogoInteractive = logoOpacity > 0.05;

  return { headerOpacity, logoOpacity, isLogoInteractive };
}
