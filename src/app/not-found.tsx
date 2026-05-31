import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { BackgroundEffects } from "@/features/app/components/BackgroundEffects";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "404 — Página no encontrada",
  description: "La página que buscas no existe en LooksMax España.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center px-5 py-16 text-center",
        "min-h-[calc(100vh-var(--lm-bottom-nav-height))]",
      )}
    >
      <BackgroundEffects />

      <div className="relative z-10 flex max-w-md flex-col items-center gap-6">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-[10px] text-black",
            "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))]",
            "shadow-[0_0_16px_rgba(232,184,75,0.3)]",
          )}
        >
          <Icon name="crown" size={28} />
        </div>

        <div>
          <p className="mb-2 lm-type-label text-lm-gold">LooksMax España</p>
          <h1
            className={cn(
              "mx-auto w-fit bg-clip-text font-display text-transparent",
              "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))]",
              "text-[clamp(4rem,18vw,8rem)] tracking-[4px]",
            )}
          >
            404
          </h1>
          <p className="mt-3 text-base font-semibold tracking-wide text-lm-text2">
            Página no encontrada
          </p>
        </div>

        <p className="text-base leading-relaxed text-lm-text2">
          Esta ruta no existe o fue movida. Vuelve al ranking oficial para seguir
          votando y explorando la comunidad.
        </p>

        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-6 py-3",
            "font-sans text-base font-bold text-black transition-transform hover:scale-[1.04]",
            "bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))]",
          )}
        >
          <Icon name="trophy" size={16} className="text-black" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
