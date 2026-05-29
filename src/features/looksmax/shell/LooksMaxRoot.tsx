"use client";

import Script from "next/script";
import { LooksMaxErrorBoundary } from "@/components/LooksMaxErrorBoundary";
import { FirebaseProvider } from "@/features/looksmax/context/FirebaseProvider";
import { LooksMaxShell } from "@/features/looksmax/shell/LooksMaxShell";
import type { ReactNode } from "react";

export function LooksMaxRoot({ children }: { children: ReactNode }) {
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
        <FirebaseProvider>
          <LooksMaxShell>{children}</LooksMaxShell>
        </FirebaseProvider>
      </LooksMaxErrorBoundary>
    </>
  );
}
