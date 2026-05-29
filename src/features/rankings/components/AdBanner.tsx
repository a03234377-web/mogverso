"use client";

import {
  isAdSenseEnabled,
  loadAdSenseScript,
  whenIdle,
  whenNearViewport,
} from "@/lib/adsense/load-script";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdBannerProps = {
  clientId?: string;
};

const FILL_CHECK_MS = 500;
const FILL_TIMEOUT_MS = 8000;
const MIN_FILLED_HEIGHT = 48;

/** Rellena el <ins> solo cuando el slot tiene ancho (>0) para evitar TagError de AdSense. */
export function AdBanner({ clientId }: AdBannerProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAdSenseEnabled(clientId)) return;

    const slot = slotRef.current;
    if (!slot) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let poll = 0;
    let timeout = 0;

    const fillAd = () => {
      if (pushed.current || cancelled) return true;
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

    const checkFilled = () => {
      const ins = slot.querySelector("ins.adsbygoogle");
      if (!ins) return false;
      const hasIframe = ins.querySelector("iframe");
      const height = ins.getBoundingClientRect().height;
      if (hasIframe && height >= MIN_FILLED_HEIGHT) {
        setVisible(true);
        return true;
      }
      return false;
    };

    const startObservers = () => {
      if (cancelled) return;
      if (fillAd()) checkFilled();

      resizeObserver = new ResizeObserver(() => {
        if (fillAd()) checkFilled();
        else checkFilled();
      });
      resizeObserver.observe(slot);

      poll = window.setInterval(checkFilled, FILL_CHECK_MS);
      timeout = window.setTimeout(() => {
        window.clearInterval(poll);
      }, FILL_TIMEOUT_MS);
    };

    let cleanupIdle = () => {};

    const cancelNearViewport = whenNearViewport(slot, () => {
      cleanupIdle = whenIdle(() => {
        void loadAdSenseScript(clientId)
          .then(startObservers)
          .catch(() => {
            /* AdSense opcional: fallo silencioso */
          });
      });
    });

    return () => {
      cancelled = true;
      cancelNearViewport();
      cleanupIdle();
      resizeObserver?.disconnect();
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, [clientId]);

  if (!isAdSenseEnabled(clientId)) return null;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1100px] justify-center px-5 max-md:px-3",
        visible ? "mb-5" : "pointer-events-none mb-0 h-0 overflow-hidden opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div ref={slotRef} className="w-full max-w-[728px] min-w-[280px]">
        <ins
          className={cn(
            "adsbygoogle block w-full overflow-hidden",
            visible && "rounded-xl border border-lm-border bg-lm-card",
          )}
          style={{ display: "block", minHeight: visible ? 90 : 1 }}
          data-ad-client={clientId}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
