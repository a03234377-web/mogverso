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

export function AdBanner({ clientId }: AdBannerProps) {
  const pushed = useRef(false);
  const slotClient = clientId ?? "ca-pub-7941266271655963";

  useEffect(() => {
    if (!slotClient || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ignore */
    }
  }, [slotClient]);

  return (
    <div className="mx-auto mb-5 flex max-w-[1100px] justify-center px-5 max-md:px-3">
      <div>
        <div className="mb-1 text-center text-[0.5rem] font-bold uppercase tracking-[2px] text-lm-text2 opacity-60" />
        <ins
          className="adsbygoogle block w-full overflow-hidden rounded-xl border border-lm-border bg-lm-card"
          style={{ display: "block", width: "100%", minHeight: 90 }}
          data-ad-client={slotClient}
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
