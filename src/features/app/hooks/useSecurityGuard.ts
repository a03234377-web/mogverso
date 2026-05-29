"use client";

import { useEffect } from "react";

/**
 * Comportamiento legacy anti-copia (clic derecho, algunos atajos).
 * No bloquea DevTools ni F12: impide depurar en local y no aporta seguridad real.
 * Solo activo en producción si NEXT_PUBLIC_ENABLE_SECURITY_GUARD=true.
 */
export function useSecurityGuard(): void {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (process.env.NEXT_PUBLIC_ENABLE_SECURITY_GUARD !== "true") return;

    const blockContext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey)) return;

      const target = e.target;
      const inTextField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (k === "f" && inTextField) return;
      if (k === "f") return;

      if (["u", "s", "p"].includes(k)) {
        e.preventDefault();
        return false;
      }
    };

    const blockDrag = (e: DragEvent) => e.preventDefault();

    document.addEventListener("contextmenu", blockContext, true);
    document.addEventListener("keydown", blockKeys, true);
    document.addEventListener("dragstart", blockDrag, true);

    return () => {
      document.removeEventListener("contextmenu", blockContext, true);
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("dragstart", blockDrag, true);
    };
  }, []);
}
