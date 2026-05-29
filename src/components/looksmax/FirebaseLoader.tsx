"use client";

import { useFirebase } from "@/contexts/FirebaseProvider";
import { cn } from "@/lib/cn";

export function FirebaseLoader() {
  const { ready, error } = useFirebase();

  if (ready && !error) return null;

  return (
    <div
      id="fb-loader"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-lm-bg transition-opacity duration-500",
        ready && "pointer-events-none opacity-0",
      )}
    >
      {error ? (
        <div className="px-4 py-4 text-center text-[0.8rem] font-bold leading-normal text-lm-red2">
          ⚠️ No se pudo conectar a Firebase. Comprueba tu configuración.
        </div>
      ) : (
        <>
          <div className="h-12 w-12 animate-spin-slow rounded-full border-[3px] border-lm-border2 border-t-lm-gold select-none" />
          <div className="font-display text-[1.1rem] tracking-[3px] text-lm-gold">Conectando a Firebase</div>
          <div className="text-[0.65rem] font-semibold uppercase tracking-[1.5px] text-lm-text2">
            Cargando datos en tiempo real…
          </div>
        </>
      )}
    </div>
  );
}
