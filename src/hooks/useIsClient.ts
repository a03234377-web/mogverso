"use client";

import { useSyncExternalStore } from "react";

/** true solo en el navegador; false en SSR e hidratación inicial. */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
