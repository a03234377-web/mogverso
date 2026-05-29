"use client";

import { useEffect } from "react";

/** Bloquea atajos de inspección (comportamiento legacy). */
export function useSecurityGuard(): void {
  useEffect(() => {
    const blockContext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey) {
        if (["u", "s", "a", "p", "f"].includes(k)) {
          e.preventDefault();
          return false;
        }
        if (e.shiftKey && ["i", "j", "c"].includes(k)) {
          e.preventDefault();
          return false;
        }
      }
      if (k === "f12") {
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
