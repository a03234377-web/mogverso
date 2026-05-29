"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { RANKERS } from "@/data/rankers";
import { initFirebaseClient } from "@/lib/firebase/client";

function loadLegacyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[data-legacy="looksmax"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "/legacy/app-runtime.js";
    script.async = true;
    script.dataset.legacy = "looksmax";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar app-runtime.js"));
    document.body.appendChild(script);
  });
}

export function LooksMaxApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    window.RANKERS = RANKERS;

    async function bootstrap() {
      try {
        const res = await fetch("/legacy-body.html");
        if (!res.ok) throw new Error("No se encontró legacy-body.html");
        const html = await res.text();
        if (rootRef.current) {
          rootRef.current.innerHTML = html;
        }
        await loadLegacyScript();
        await initFirebaseClient();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al iniciar la app");
        console.error(e);
      }
    }

    bootstrap();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090f] p-6 text-center text-[#f0ece0]">
        <div>
          <p className="mb-2 text-xl font-bold text-[#ff4757]">⚠️ Error</p>
          <p className="text-sm text-[#8a8070]">{error}</p>
        </div>
      </div>
    );
  }

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
      <div ref={rootRef} id="looksmax-root" className="looksmax-app" />
    </>
  );
}
