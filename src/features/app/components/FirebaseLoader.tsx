"use client";

import { IconLabel } from "@/components/icons";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function FirebaseLoader() {
  const { ready, error } = useFirebase();

  if (ready && !error) return null;

  return (
    <div
      id="fb-loader"
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4",
        "bg-lm-bg transition-opacity duration-500",
        ready && "pointer-events-none opacity-0",
      )}
    >
      {error ? (
        <div className="px-4 py-4 text-center text-base leading-normal font-bold text-lm-red2">
          <IconLabel icon="alert-triangle" iconSize={18}>
            No se pudo conectar a Firebase. Comprueba tu configuración.
          </IconLabel>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "h-12 w-12 animate-spin-slow rounded-full border-[3px] select-none",
              "border-lm-border2 border-t-lm-gold",
            )}
          />
          <div className="font-sans text-base font-bold tracking-tight text-lm-gold">
            Conectando a Firebase
          </div>
          <div className="lm-type-label text-lm-text2">
            Cargando datos en tiempo real…
          </div>
        </>
      )}
    </div>
  );
}
