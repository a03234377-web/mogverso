"use client";

import { useCallback, useState } from "react";
import type { KeyboardEvent } from "react";
import { Keys } from "@/lib/a11y/keyboard";

type Orientation = "horizontal" | "vertical";

type UseRovingTabIndexOptions = {
  count: number;
  selectedIndex: number;
  orientation?: Orientation;
  loop?: boolean;
};

export function useRovingTabIndex({
  count,
  selectedIndex,
  orientation = "horizontal",
  loop = true,
}: UseRovingTabIndexOptions) {
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);

  const getTabIndex = useCallback(
    (index: number) => (index === focusedIndex ? 0 : -1),
    [focusedIndex],
  );

  const moveFocus = useCallback(
    (delta: number) => {
      setFocusedIndex((current) => {
        let next = current + delta;
        if (loop) {
          if (next < 0) next = count - 1;
          if (next >= count) next = 0;
        } else {
          next = Math.max(0, Math.min(count - 1, next));
        }
        return next;
      });
    },
    [count, loop],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const prevKey = orientation === "horizontal" ? Keys.ArrowLeft : Keys.ArrowUp;
      const nextKey = orientation === "horizontal" ? Keys.ArrowRight : Keys.ArrowDown;

      if (e.key === prevKey) {
        e.preventDefault();
        moveFocus(-1);
      } else if (e.key === nextKey) {
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === Keys.Home) {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === Keys.End) {
        e.preventDefault();
        setFocusedIndex(count - 1);
      }
    },
    [count, moveFocus, orientation],
  );

  const syncFocusedIndex = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  return { focusedIndex, getTabIndex, onKeyDown, syncFocusedIndex, setFocusedIndex };
}
