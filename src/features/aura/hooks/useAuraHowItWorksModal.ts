"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  hasSeenAuraHowItWorks,
  markAuraHowItWorksSeen,
} from "@/lib/aura/how-it-works-storage";

function subscribeHowItWorksSeen() {
  return () => {};
}

/** Modal «Cómo funciona» en /aura: solo la primera vez (localStorage). */
export function useAuraHowItWorksModal() {
  const [dismissed, setDismissed] = useState(false);
  const seenBefore = useSyncExternalStore(
    subscribeHowItWorksSeen,
    () => hasSeenAuraHowItWorks(),
    () => true,
  );

  const open = !seenBefore && !dismissed;

  const close = useCallback(() => {
    markAuraHowItWorksSeen();
    setDismissed(true);
  }, []);

  return { open, close };
}
