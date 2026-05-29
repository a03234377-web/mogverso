"use client";

import { LooksMaxErrorBoundary } from "@/components/LooksMaxErrorBoundary";
import { FirebaseProvider } from "@/features/app/context/FirebaseProvider";
import { LooksMaxShell } from "@/features/app/shell/LooksMaxShell";
import type { ReactNode } from "react";

/**
 * AdSense se carga bajo demanda desde `AdBanner` (idle + solo en rankings).
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
