"use client";

import { Modal, ModalCloseButton } from "@/components/looksmax/ui/Modal";

type DiscordModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DiscordModal({ open, onClose }: DiscordModalProps) {
  return (
    <Modal open={open} onClose={onClose} id="modalUnirse">
      <ModalCloseButton onClose={onClose} />
      <DiscordModalContent />
    </Modal>
  );
}

export function DiscordModalContent() {
  return (
    <>
      <div className="animate-modal-crown mb-2.5 text-center text-[2.8rem]">👑</div>
      <div className="font-display mb-1 text-center text-[clamp(1.5rem,5vw,2.4rem)] leading-tight tracking-[3px] bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2)_50%,var(--color-lm-gold)_100%)] bg-clip-text text-transparent max-md:text-[clamp(1.8rem,5vw,2.6rem)]">
        Únete a la
        <br />
        Comunidad
      </div>
      <div className="mb-5 text-center text-[0.72rem] font-bold uppercase tracking-[1.5px] text-lm-gold">
        🇪🇸 ES Looksmaxer · Miembros Exclusivos
      </div>
      <div className="mb-5 h-px bg-[linear-gradient(90deg,transparent,var(--color-lm-border2),transparent)]" />
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.12)] bg-[rgba(232,184,75,0.05)] px-3.5 py-3">
          <div className="shrink-0 text-[1.3rem] leading-snug">🏆</div>
          <div>
            <strong className="mb-0.5 block text-[0.82rem] font-extrabold text-lm-text">
              Añade tu creador al ranking
            </strong>
            <span className="text-[0.7rem] font-semibold leading-snug text-lm-text2">
              Propón a tu creador favorito para que entre en el ranking oficial de LooksMax España
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.12)] bg-[rgba(232,184,75,0.05)] px-3.5 py-3">
          <div className="shrink-0 text-[1.3rem] leading-snug">🗳️</div>
          <div>
            <strong className="mb-0.5 block text-[0.82rem] font-extrabold text-lm-text">
              Influye en las votaciones
            </strong>
            <span className="text-[0.7rem] font-semibold leading-snug text-lm-text2">
              Tu voto cuenta para decidir quién sube o baja en el ranking de la comunidad
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-[rgba(232,184,75,0.12)] bg-[rgba(232,184,75,0.05)] px-3.5 py-3">
          <div className="shrink-0 text-[1.3rem] leading-snug">⚡</div>
          <div>
            <strong className="mb-0.5 block text-[0.82rem] font-extrabold text-lm-text">
              Ventajas exclusivas de miembro
            </strong>
            <span className="text-[0.7rem] font-semibold leading-snug text-lm-text2">
              Acceso anticipado a nuevas funciones, batallas especiales y mucho más
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-[14px] border border-[rgba(88,101,242,0.4)] bg-[linear-gradient(135deg,rgba(88,101,242,0.15),rgba(88,101,242,0.05))] px-4 py-4 text-center">
        <div className="mb-1 text-[0.62rem] font-extrabold uppercase tracking-[1.5px] text-[#7289da]">
          💬 Únete a nuestro servidor de Discord
        </div>
        <a
          className="mt-1.5 inline-flex items-center gap-2 rounded-[10px] border-none bg-[linear-gradient(135deg,#5865f2,#7289da)] px-5 py-2.5 font-sans text-[0.9rem] font-extrabold tracking-wide text-white no-underline transition-all duration-250 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] max-md:min-h-12 max-md:px-5 max-md:py-3 max-md:text-[0.95rem]"
          href="https://discord.gg/QfnJkJy8jw"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="inline-flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.034.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
          </span>
          Entrar al Servidor
        </a>
      </div>
      <div className="mt-4 text-center text-[0.62rem] font-semibold text-lm-text2">
        🔒 Comunidad privada · Precios y condiciones por Discord
      </div>
    </>
  );
}
