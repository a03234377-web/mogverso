"use client";

import { Suspense, use, useMemo, useState } from "react";
import Script from "next/script";
import { LooksMaxErrorBoundary } from "@/components/LooksMaxErrorBoundary";
import { bootstrapLooksMax } from "@/lib/legacy/bootstrap";

type LooksMaxAppProps = {
  legacyHtml: string;
};

function LegacyBootstrap({
  root,
  legacyHtml,
}: {
  root: HTMLDivElement;
  legacyHtml: string;
}) {
  const promise = useMemo(
    () => bootstrapLooksMax(root, legacyHtml),
    [root, legacyHtml],
  );
  use(promise);
  return null;
}

function LooksMaxRoot({ legacyHtml }: { legacyHtml: string }) {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={setRootEl} id="looksmax-root" className="looksmax-app" />
      {rootEl && (
        <Suspense fallback={null}>
          <LegacyBootstrap root={rootEl} legacyHtml={legacyHtml} />
        </Suspense>
      )}
    </>
  );
}

export function LooksMaxApp({ legacyHtml }: LooksMaxAppProps) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      {adsenseClient && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {recaptchaKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`}
          strategy="afterInteractive"
        />
      )}
      <LooksMaxErrorBoundary>
        <LooksMaxRoot legacyHtml={legacyHtml} />
      </LooksMaxErrorBoundary>
    </>
  );
}
