"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdBannerProps = {
  clientId?: string;
};

/** Rellena el <ins> solo cuando el slot tiene ancho (>0) para evitar TagError de AdSense. */
export function AdBanner({ clientId }: AdBannerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!clientId || pushed.current) return;

    const slot = slotRef.current;
    if (!slot) return;

    const fillAd = () => {
      if (pushed.current) return true;
      const width = slot.getBoundingClientRect().width;
      if (width < 48) return false;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
        return true;
      } catch {
        return false;
      }
    };

    if (fillAd()) return;

    const observer = new ResizeObserver(() => {
      if (fillAd()) observer.disconnect();
    });
    observer.observe(slot);

    return () => observer.disconnect();
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="mx-auto mb-5 flex w-full max-w-[1100px] justify-center px-5 max-md:px-3">
      <div ref={slotRef} className="w-full max-w-[728px] min-w-[280px]">
        <ins
          className="adsbygoogle block w-full overflow-hidden rounded-xl border border-lm-border bg-lm-card"
          style={{ display: "block", minHeight: 90 }}
          data-ad-client={clientId}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
