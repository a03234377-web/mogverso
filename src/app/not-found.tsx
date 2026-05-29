import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { BackgroundEffects } from "@/components/looksmax/ui/BackgroundEffects";

export const metadata: Metadata = {
  title: "404 — Página no encontrada",
  description: "La página que buscas no existe en LooksMax España.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-var(--lm-bottom-nav-height))] flex-col items-center justify-center px-5 py-16 text-center">
      <BackgroundEffects />

      <div className="relative z-10 flex max-w-md flex-col items-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] text-black shadow-[0_0_16px_rgba(232,184,75,0.3)]">
          <Icon name="crown" size={28} />
        </div>

        <div>
          <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[3px] text-lm-gold">
            LooksMax España
          </p>
          <h1 className="font-display bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text text-[clamp(4rem,18vw,8rem)] leading-none tracking-[4px] text-transparent">
            404
          </h1>
          <p className="mt-3 text-[0.85rem] font-semibold uppercase tracking-[2px] text-lm-text2">
            Página no encontrada
          </p>
        </div>

        <p className="text-[0.8rem] leading-relaxed text-lm-text2">
          Esta ruta no existe o fue movida. Vuelve al ranking oficial para seguir votando y
          explorando la comunidad.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] px-6 py-3 text-[0.75rem] font-extrabold uppercase tracking-[0.8px] text-black transition-transform hover:scale-[1.04]"
        >
          <Icon name="trophy" size={16} className="text-black" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
