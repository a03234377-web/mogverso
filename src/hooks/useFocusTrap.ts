"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
  );
}

type UseFocusTrapOptions = {
  initialFocus?: "first" | "container";
  restoreFocus?: boolean;
};

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  options?: UseFocusTrapOptions,
): RefObject<T | null> {
  const { initialFocus = "first", restoreFocus = true } = options ?? {};
  const ref = useRef<T | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const container = ref.current;
    if (!container) return;

    const focusables = getFocusable(container);
    if (initialFocus === "first" && focusables[0]) {
      focusables[0].focus();
    } else if (initialFocus === "container") {
      container.focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;

      const items = getFocusable(ref.current);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (restoreFocus && previousFocus.current?.isConnected) {
        previousFocus.current.focus();
      }
    };
  }, [active, initialFocus, restoreFocus]);

  return ref;
}
