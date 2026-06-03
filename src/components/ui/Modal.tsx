"use client";

import { useCallback, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
  describedBy?: string;
  /** Bloquea backdrop, Escape y botón X (p. ej. countdown promo torneo). */
  preventClose?: boolean;
};

export function Modal({
  open,
  onClose,
  children,
  id,
  labelledBy,
  describedBy,
  preventClose = false,
}: ModalProps) {
  useScrollLock(open);

  const setDialogRef = useCallback(
    (node: HTMLDialogElement | null) => {
      if (!node) return;
      if (open && !node.open) node.showModal();
      else if (!open && node.open) node.close();
    },
    [open],
  );

  const handleDialogClose = useCallback(() => {
    if (preventClose) return;
    onClose();
  }, [preventClose, onClose]);

  return (
    <dialog
      ref={setDialogRef}
      id={id}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn(
        "fixed inset-0 z-[9998] m-0 h-full max-h-none w-full max-w-none",
        "border-0 bg-transparent p-5 open:flex open:items-center open:justify-center",
        "backdrop:bg-black/75 backdrop:backdrop-blur-sm",
        "touch-none overscroll-contain",
        "p-2 max-md:open:items-end",
      )}
      onClose={handleDialogClose}
      onCancel={(e) => {
        if (preventClose) e.preventDefault();
      }}
    >
      {!preventClose ? (
        <button
          type="button"
          aria-label="Cerrar diálogo"
          className="fixed inset-0 m-0 h-full w-full cursor-default border-0 bg-transparent p-0"
          onClick={onClose}
        />
      ) : (
        <div className="fixed inset-0 m-0 h-full w-full" aria-hidden />
      )}
      <div
        className={cn(
          "relative z-[1] w-full max-w-[700px] rounded-[22px] border px-8 py-9",
          "border-[rgba(232,184,75,0.45)]",
          "bg-[linear-gradient(145deg,var(--color-lm-card),var(--color-lm-bg2))]",
          "shadow-[0_0_60px_rgba(232,184,75,0.12),0_24px_60px_rgba(0,0,0,0.5)]",
          "transition-all duration-350",
          "touch-auto max-md:max-h-[90vh] max-md:max-w-full max-md:overflow-y-auto",
          "max-md:rounded-t-[20px] max-md:rounded-b-none max-md:px-5 max-md:pt-7 max-md:pb-8",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </dialog>
  );
}

export function ModalCloseButton({
  onClose,
  disabled,
}: {
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label="Cerrar"
      disabled={disabled}
      className={cn(
        "absolute top-3.5 right-4 flex size-[30px] cursor-pointer items-center",
        "justify-center rounded-full border border-lm-border bg-white/6",
        "text-lm-text2 lm-focus-ring transition-all duration-200",
        "hover:bg-white/12 hover:text-lm-text",
        disabled && "pointer-events-none cursor-not-allowed opacity-40",
      )}
      onClick={onClose}
    >
      <Icon name="x" size={16} />
    </button>
  );
}
