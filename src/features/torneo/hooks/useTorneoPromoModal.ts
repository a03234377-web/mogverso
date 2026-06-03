"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { hasSeenTorneoPromo, markTorneoPromoSeen } from "@/lib/torneo-promo-storage";

function subscribePromoSeen() {
  return () => {};
}

export function useTorneoPromoModal() {
  const [dismissed, setDismissed] = useState(false);
  const seenBefore = useSyncExternalStore(
    subscribePromoSeen,
    () => hasSeenTorneoPromo(),
    () => true,
  );

  const open = !seenBefore && !dismissed;

  const close = useCallback((dontShowAgain: boolean) => {
    if (dontShowAgain) {
      markTorneoPromoSeen();
    }
    setDismissed(true);
  }, []);

  return { open, close };
}
