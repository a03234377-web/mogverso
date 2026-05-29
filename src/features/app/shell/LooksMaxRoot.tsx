"use client";

import { LooksMaxErrorBoundary } from "@/components/LooksMaxErrorBoundary";
import { FirebaseProvider } from "@/features/app/context/FirebaseProvider";
import { LooksMaxShell } from "@/features/app/shell/LooksMaxShell";
import type { ReactNode } from "react";

/**
 * Scripts de terceros (AdSense, reCAPTCHA) van en `app/layout.tsx` como <script> nativo
 * para evitar atributos `data-nscript` de next/script que AdSense no soporta.
 * reCAPTCHA: cargar bajo demanda cuando exista flujo de voto que lo use.
 */
export function LooksMaxRoot({ children }: { children: ReactNode }) {
  return (
    <LooksMaxErrorBoundary>
      <FirebaseProvider>
        <LooksMaxShell>{children}</LooksMaxShell>
      </FirebaseProvider>
    </LooksMaxErrorBoundary>
  );
}
