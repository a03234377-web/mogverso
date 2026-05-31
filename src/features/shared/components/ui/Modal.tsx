"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
  describedBy?: string;
};

export function Modal({
  open,
  onClose,
  children,
  id,
  labelledBy,
  describedBy,
}: ModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, {
    initialFocus: "first",
    restoreFocus: true,
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9998] flex items-center justify-center bg-black/75 p-5",
        "backdrop-blur-sm max-md:items-end max-md:p-2",
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={cn(
          "relative w-full max-w-[440px] rounded-[22px] border px-8 py-9",
          "border-[rgba(232,184,75,0.45)]",
          "bg-[linear-gradient(145deg,var(--color-lm-card),var(--color-lm-bg2))]",
          "shadow-[0_0_60px_rgba(232,184,75,0.12),0_24px_60px_rgba(0,0,0,0.5)]",
          "transition-all duration-350",
          "max-md:max-h-[90vh] max-md:max-w-full max-md:overflow-y-auto",
          "max-md:rounded-t-[20px] max-md:rounded-b-none max-md:px-5 max-md:pt-7 max-md:pb-8",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Cerrar"
      className={cn(
        "absolute top-3.5 right-4 flex h-[30px] w-[30px] cursor-pointer items-center",
        "justify-center rounded-full border border-lm-border bg-white/6",
        "text-lm-text2 lm-focus-ring transition-all duration-200",
        "hover:bg-white/12 hover:text-lm-text",
      )}
      onClick={onClose}
    >
      <Icon name="x" size={16} />
    </button>
  );
}
