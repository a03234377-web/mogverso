"use client";

import { useEffect, useState } from "react";
import { buildOctavosMatchesFromSeed } from "@/lib/torneo-bracket";
import type { TorneoMatch } from "@/types/looksmax";

export function useTorneoBracketPreview(enabled: boolean) {
  const [previewMatches, setPreviewMatches] = useState<Record<
    string,
    TorneoMatch
  > | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/torneo/preview");
        const data = (await res.json()) as {
          ok?: boolean;
          seedNames?: string[];
        };
        if (cancelled || !res.ok || !data.ok || !data.seedNames?.length) return;
        setPreviewMatches(buildOctavosMatchesFromSeed(data.seedNames));
      } catch (err) {
        console.error("[useTorneoBracketPreview]", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return enabled ? previewMatches : null;
}
