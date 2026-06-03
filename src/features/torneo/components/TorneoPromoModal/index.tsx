"use client";

import { useCallback, useState } from "react";
import { Icon, IconLabel } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { useCloseCountdown } from "@/features/torneo/hooks/useCloseCountdown";
import { cn } from "@/lib/cn";

type TorneoPromoModalProps = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
};

const PORTFOLIO_URL = "https://fravelz.vercel.app/es";
const GITHUB_URL = "https://github.com/FraVelz";

const ruleCardClass = cn(
  "flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.14)]",
  "bg-[rgba(232,184,75,0.06)] px-3.5 py-3",
);

const PROMO_ITEMS = [
  {
    icon: "sparkles" as const,
    text: "Interfaces fluidas, animadas y bien maquetadas (Next.js, React, Tailwind).",
  },
  {
    icon: "zap" as const,
    text: "Integración con backend, SEO y código mantenible.",
  },
  {
    icon: "target" as const,
    text: "Portafolio con diferentes proyectos y mucho más.",
  },
] as const;

export function TorneoPromoModal({ open, onClose }: TorneoPromoModalProps) {
  const { remaining, canClose } = useCloseCountdown(open, 5);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    if (!canClose) return;
    onClose(dontShowAgain);
    setDontShowAgain(false);
  }, [canClose, dontShowAgain, onClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      preventClose={!canClose}
      id="modal-torneo-promo"
      labelledBy="torneo-promo-title"
      describedBy="torneo-promo-desc"
    >
      <div>
        <div className="mb-3 flex justify-center" aria-hidden>
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl",
              "border border-[rgba(232,184,75,0.35)]",
              "bg-[linear-gradient(145deg,rgba(232,184,75,0.2),rgba(232,184,75,0.05))]",
              "shadow-[0_0_28px_rgba(232,184,75,0.2)]",
            )}
          >
            <Icon name="rocket" size={32} className="text-lm-gold" />
          </div>
        </div>

        <h2
          id="torneo-promo-title"
          className={cn(
            "mb-1 bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2)_55%,var(--color-lm-gold)_100%)]",
            "bg-clip-text text-center font-sans text-[clamp(1.35rem,5vw,1.85rem)]",
            "leading-tight font-bold tracking-tight text-transparent",
          )}
        >
          ¿Necesitas una web así?
        </h2>

        <p
          id="torneo-promo-desc"
          className="mb-5 text-center text-sm font-semibold text-lm-text2"
        >
          Francisco J. Vélez O. · @Fravelz — Desarrollador Frontend
        </p>

        <div className="mb-5 h-px bg-[linear-gradient(90deg,transparent,var(--color-lm-border2),transparent)]" />

        <ul className="mb-5 flex list-none flex-col gap-3 p-0">
          {PROMO_ITEMS.map((item) => (
            <li key={item.text} className={ruleCardClass}>
              <Icon
                name={item.icon}
                size={22}
                className="mt-0.5 shrink-0 text-lm-gold"
                aria-hidden
              />
              <span className="text-base leading-snug font-semibold text-lm-text2">
                {item.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center rounded-[12px]",
              "border border-[rgba(232,184,75,0.35)] bg-[rgba(232,184,75,0.1)]",
              "px-4 py-2.5 text-center text-sm font-bold text-lm-gold lm-focus-ring",
              "transition-colors hover:bg-[rgba(232,184,75,0.18)]",
            )}
          >
            Ver portafolio
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[12px]",
              "border border-lm-border bg-lm-bg2 px-4 py-2.5 text-sm font-bold text-lm-text2",
              "lm-focus-ring transition-colors hover:text-lm-text",
            )}
          >
            <Icon name="building-2" size={18} aria-hidden />
            GitHub
          </a>
        </div>

        <p className="mb-5 text-center text-xs text-lm-text2">
          <a href="mailto:fravelz@proton.me" className="text-lm-gold hover:underline">
            fravelz@proton.me
          </a>
        </p>

        <div className="flex flex-col gap-3">
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3",
              "lm-focus-ring transition-colors duration-200",
              dontShowAgain
                ? "border-[rgba(232,184,75,0.45)] bg-[rgba(232,184,75,0.12)]"
                : "border-[rgba(232,184,75,0.14)] bg-[rgba(232,184,75,0.04)] hover:bg-[rgba(232,184,75,0.08)]",
            )}
          >
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="sr-only"
            />
            <span
              className={cn(
                "flex size-[22px] shrink-0 items-center justify-center rounded-md border-2",
                "transition-all duration-200",
                dontShowAgain
                  ? "border-lm-gold bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold))] text-lm-bg"
                  : "border-[rgba(232,184,75,0.35)] bg-transparent",
              )}
              aria-hidden
            >
              {dontShowAgain ? <Icon name="check" size={14} strokeWidth={3} /> : null}
            </span>
            <span className="text-left text-sm leading-snug font-semibold text-lm-text2">
              No volver a mostrar la próxima vez
            </span>
          </label>

          <button
            type="button"
            disabled={!canClose}
            className={cn(
              "min-h-12 w-full cursor-pointer rounded-[12px] border-none",
              "bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold))]",
              "px-5 py-3.5 font-sans text-base font-bold text-lm-bg",
              "lm-focus-ring transition-all duration-250",
              "hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(232,184,75,0.35)]",
              "max-md:min-h-[3.25rem]",
              "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100",
            )}
            onClick={handleClose}
          >
            <IconLabel icon="check" iconSize={18} className="justify-center text-lm-bg">
              {canClose ? "Entendido, cerrar" : `Podrás cerrar en ${remaining} s`}
            </IconLabel>
          </button>
        </div>
      </div>
    </Modal>
  );
}
