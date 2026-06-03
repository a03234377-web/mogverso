"use client";

import { useEffect, useState } from "react";

/** Cuenta atrás en segundos al abrir un modal (p. ej. 5 s antes de poder cerrar). */
export function useCloseCountdown(open: boolean, seconds = 5) {
  const [mounted, setMounted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setElapsed(0);
  }

  useEffect(() => {
    if (!mounted || !open) return;
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [mounted, open, seconds]);

  if (!mounted) {
    return { remaining: seconds, canClose: false };
  }

  const remaining = Math.max(0, seconds - elapsed);

  return {
    remaining,
    canClose: remaining <= 0,
  };
}
