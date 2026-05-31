"use client";

import { PageHeader } from "@/features/shared/components/PageHeader";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { Icon } from "@/components/icons";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export function ConsejoPage() {
  return (
    <ActivePage id="page-consejo" active>
      <PageHeader
        icon="book-open"
        title="Consejos"
        desc="Guía diaria para mejorar tu físico y presencia"
      />
      <div className="mx-auto max-w-[900px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
          <div
            className={cn(
              "col-span-full flex items-start gap-5 rounded-xl border border-[rgba(232,184,75,0.35)]",
              "bg-lm-card p-5 max-md:flex-row",
            )}
          >
            <Icon name="sun" size={36} className="shrink-0 text-lm-gold max-md:w-7" />
            <div>
              <div className="mb-1.5 flex items-center gap-1 text-sm font-bold tracking-wide text-lm-gold uppercase">
                <Icon name="star" size={12} />
                Consejo del Día
              </div>
              <h3 className="mb-1.5 font-sans text-lg leading-snug font-bold text-lm-text">
                La Regla del 3–6–9 en Hidratación Cutánea
              </h3>
              <p className="font-serif text-base leading-relaxed text-lm-text2">
                Aplica hidratante con SPF 30+ por la mañana, ácido hialurónico al
                mediodía, y retinol por la noche. La consistencia supera a cualquier
                producto milagroso.
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-sm text-lm-text2">
                <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold">
                  PIEL
                </span>
                <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold">
                  HIDRATACIÓN
                </span>
              </div>
            </div>
          </div>
          <ConsejoCard
            cat="gym"
            catIcon="dumbbell"
            catLabel="Gym"
            title="Mewing + Mordida"
            body="El mewing correcto sin una oclusión trabajada es la mitad del trabajo. Consulta a un ortodoncista."
            tag="JAW"
          />
          <ConsejoCard
            cat="nutricion"
            catIcon="beef"
            catLabel="Nutrición"
            title="Proteína + Colágeno"
            body="2g de proteína por kg de peso, más 10g de colágeno hidrolizado con vitamina C en ayunas."
            tag="DIETA"
          />
          <ConsejoCard
            cat="estilo"
            catIcon="shirt"
            catLabel="Estilo"
            title="El Ajuste es el Rey"
            body="Una camiseta de 15€ bien ajustada supera a cualquier pieza de lujo talla L."
            tag="ROPA"
          />
          <ConsejoCard
            cat="mente"
            catIcon="brain"
            catLabel="Mentalidad"
            title="El Proceso es el Resultado"
            body="Los mejores looksmaxers ejecutan el protocolo, documentan cada 30 días y confían en el proceso."
            tag="PSICOLOGÍA"
          />
        </div>
      </div>
    </ActivePage>
  );
}

function ConsejoCard({
  cat,
  catIcon,
  catLabel,
  title,
  body,
  tag,
}: {
  cat: string;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-lm-border bg-lm-card p-5 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-lm-border2",
      )}
    >
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1 text-sm font-bold tracking-wide uppercase",
          `consejo-cat--${cat}`,
        )}
      >
        <Icon name={catIcon} size={12} />
        {catLabel}
      </div>
      <h3 className="mb-1.5 font-sans text-base leading-snug font-bold text-lm-text">
        {title}
      </h3>
      <p className="font-serif text-base leading-relaxed text-lm-text2">{body}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold text-lm-text2">
          {tag}
        </span>
      </div>
    </div>
  );
}
