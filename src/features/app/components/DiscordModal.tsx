"use client";

import { Icon, IconLabel } from "@/components/icons";
import { Modal, ModalCloseButton } from "@/features/shared/components/ui/Modal";
import { cn } from "@/lib/cn";

type DiscordModalProps = {
  open: boolean;
  onClose: () => void;
};

const benefitCardClass = cn(
  "flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.12)]",
  "bg-[rgba(232,184,75,0.05)] px-3.5 py-3",
);

const DISCORD_ICON_PATH =
  "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25" +
  "a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37" +
  "a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.9 19.9 0 0 0 5.993 3.03" +
  ".078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892" +
  ".077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0" +
  "a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892" +
  ".077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03" +
  ".077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z";

export function DiscordModal({ open, onClose }: DiscordModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      id="modalUnirse"
      labelledBy="discord-modal-title"
    >
      <ModalCloseButton onClose={onClose} />
      <DiscordModalContent />
    </Modal>
  );
}

export function DiscordModalContent() {
  return (
    <>
      <div className="mb-2.5 flex animate-modal-crown justify-center" aria-hidden>
        <Icon name="crown" size={44} className="text-lm-gold" />
      </div>
      <div
        id="discord-modal-title"
        className={cn(
          "mb-1 bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2)_50%,var(--color-lm-gold)_100%)]",
          "bg-clip-text text-center font-sans text-[clamp(1.35rem,5vw,2rem)] leading-tight font-bold",
          "tracking-tight text-transparent max-md:text-[clamp(1.5rem,5vw,2.2rem)]",
        )}
      >
        Únete a la
        <br />
        Comunidad
      </div>
      <div className="mb-5 text-center lm-type-label text-lm-gold">
        ES Looksmaxer · Miembros Exclusivos
      </div>
      <div className="mb-5 h-px bg-[linear-gradient(90deg,transparent,var(--color-lm-border2),transparent)]" />
      <div className="mb-6 flex flex-col gap-3">
        <div className={benefitCardClass}>
          <Icon
            name="trophy"
            size={22}
            className="mt-0.5 shrink-0 text-lm-gold"
            aria-hidden
          />
          <div>
            <strong className="mb-0.5 block text-base font-bold text-lm-text">
              Añade tu creador al ranking
            </strong>
            <span className="text-base leading-snug font-semibold text-lm-text2">
              Propón a tu creador favorito para que entre en el ranking oficial de
              LooksMax España
            </span>
          </div>
        </div>
        <div className={benefitCardClass}>
          <Icon
            name="vote"
            size={22}
            className="mt-0.5 shrink-0 text-lm-gold"
            aria-hidden
          />
          <div>
            <strong className="mb-0.5 block text-base font-bold text-lm-text">
              Influye en las votaciones
            </strong>
            <span className="text-base leading-snug font-semibold text-lm-text2">
              Tu voto cuenta para decidir quién sube o baja en el ranking de la
              comunidad
            </span>
          </div>
        </div>
        <div className={benefitCardClass}>
          <Icon
            name="zap"
            size={22}
            className="mt-0.5 shrink-0 text-lm-gold"
            aria-hidden
          />
          <div>
            <strong className="mb-0.5 block text-base font-bold text-lm-text">
              Ventajas exclusivas de miembro
            </strong>
            <span className="text-base leading-snug font-semibold text-lm-text2">
              Acceso anticipado a nuevas funciones, batallas especiales y mucho más
            </span>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "rounded-[14px] border border-[rgba(88,101,242,0.4)] px-4 py-4 text-center",
          "bg-[linear-gradient(135deg,rgba(88,101,242,0.15),rgba(88,101,242,0.05))]",
        )}
      >
        <div className="mb-1 flex items-center justify-center gap-1.5 lm-type-label text-[#7289da]">
          <Icon name="message-circle" size={14} />
          Únete a nuestro servidor de Discord
        </div>
        <a
          className={cn(
            "mt-1.5 inline-flex items-center gap-2 rounded-[10px] border-none",
            "bg-[linear-gradient(135deg,#5865f2,#7289da)] px-5 py-2.5 font-sans text-base font-bold",
            "text-white no-underline lm-focus-ring transition-all duration-250",
            "hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)]",
            "max-md:min-h-12 max-md:px-5 max-md:py-3 max-md:text-base",
          )}
          href="https://discord.gg/QfnJkJy8jw"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-flex" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d={DISCORD_ICON_PATH} />
            </svg>
          </span>
          Entrar al Servidor
        </a>
      </div>
      <div className="mt-4 text-center text-sm font-semibold text-lm-text2">
        <IconLabel icon="lock" iconSize={12} className="justify-center">
          Comunidad privada · Precios y condiciones por Discord
        </IconLabel>
      </div>
    </>
  );
}
