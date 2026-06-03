"use client";

import { useEffect, useState } from "react";

/** Cuenta atrás en segundos al abrir un modal (p. ej. 5 s antes de poder cerrar). */
export function useCloseCountdown(open: boolean, seconds = 5) {
  const [elapsed, setElapsed] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setElapsed(0);
  }

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, seconds]);

  const remaining = Math.max(0, seconds - elapsed);

  return {
    remaining,
    canClose: remaining <= 0,
  };
}
