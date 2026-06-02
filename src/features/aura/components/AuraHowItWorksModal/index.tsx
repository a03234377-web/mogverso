"use client";

import { useRef } from "react";
import { Icon, IconLabel } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { cn } from "@/lib/cn";
import { useAuraHowItWorksGsap } from "./useAuraHowItWorksGsap";

type AuraHowItWorksModalProps = {
  open: boolean;
  onClose: () => void;
};

const ruleCardClass = cn(
  "flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.14)]",
  "bg-[rgba(232,184,75,0.06)] px-3.5 py-3",
);

const RULES = [
  {
    icon: "vote" as const,
    text: `Tienes ${AURA_VOTES_PER_WEEK} votos en total con los que puedes votar a ${AURA_VOTES_PER_WEEK} personas diferentes.`,
  },
  {
    icon: "sparkles" as const,
    text: `Se puede votar para sumar o restar aura de los ${AURA_VOTES_PER_WEEK} que tú quieras.`,
  },
  {
    icon: "calendar" as const,
    text: "Cada semana se reinician la cantidad de tus votos y cada mes los votos de todos los candidatos.",
  },
] as const;

export function AuraHowItWorksModal({ open, onClose }: AuraHowItWorksModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useAuraHowItWorksGsap(open, { panelRef, iconRef, titleRef, listRef, ctaRef });

  return (
    <Modal
      open={open}
      onClose={onClose}
      id="modal-aura-how-it-works"
      labelledBy="aura-how-it-works-title"
      describedBy="aura-how-it-works-desc"
    >
      <div ref={panelRef}>
        <div ref={iconRef} className="mb-3 flex justify-center" aria-hidden>
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl",
              "border border-[rgba(232,184,75,0.35)]",
              "bg-[linear-gradient(145deg,rgba(232,184,75,0.2),rgba(232,184,75,0.05))]",
              "shadow-[0_0_28px_rgba(232,184,75,0.2)]",
            )}
          >
            <Icon name="sparkles" size={32} className="text-lm-gold" />
          </div>
        </div>

        <h2
          id="aura-how-it-works-title"
          ref={titleRef}
          className={cn(
            "mb-1 bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2)_55%,var(--color-lm-gold)_100%)]",
            "bg-clip-text text-center font-sans text-[clamp(1.35rem,5vw,1.85rem)]",
            "leading-tight font-bold tracking-tight text-transparent",
          )}
        >
          Cómo funciona
        </h2>

        <p
          id="aura-how-it-works-desc"
          className="mb-5 text-center text-sm font-semibold text-lm-text2"
        >
          Aura LooksMax en un minuto
        </p>

        <div className="mb-5 h-px bg-[linear-gradient(90deg,transparent,var(--color-lm-border2),transparent)]" />

        <ul ref={listRef} className="mb-6 flex list-none flex-col gap-3 p-0">
          {RULES.map((rule) => (
            <li key={rule.text} data-aura-how-item className={ruleCardClass}>
              <Icon
                name={rule.icon}
                size={22}
                className="mt-0.5 shrink-0 text-lm-gold"
                aria-hidden
              />
              <span className="text-base leading-snug font-semibold text-lm-text2">
                {rule.text}
              </span>
            </li>
          ))}
        </ul>

        <div ref={ctaRef} className="flex flex-col gap-2">
          <button
            type="button"
            className={cn(
              "min-h-12 w-full cursor-pointer rounded-[12px] border-none",
              "bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold))]",
              "px-5 py-3.5 font-sans text-base font-bold text-lm-bg",
              "lm-focus-ring transition-all duration-250",
              "hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(232,184,75,0.35)]",
              "max-md:min-h-[3.25rem]",
            )}
            onClick={onClose}
          >
            <IconLabel icon="check" iconSize={18} className="justify-center text-lm-bg">
              Entendido, cerrar
            </IconLabel>
          </button>
        </div>
      </div>
    </Modal>
  );
}
