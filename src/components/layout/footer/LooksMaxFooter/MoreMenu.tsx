"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

export function MoreMenu({
  onClose,
  onOpenDiscord,
}: {
  onClose: () => void;
  onOpenDiscord: () => void;
}) {
  const menuRef = useFocusTrap<HTMLDivElement>(true, { initialFocus: "first" });

  return (
    <div
      ref={menuRef}
      id="moreMenu"
      role="menu"
      aria-label="Más secciones"
      className={cn(
        "fixed right-3 left-3 z-[200] rounded-2xl border border-lm-border2 bg-lm-card p-3",
        "shadow-[0_-8px_32px_rgba(0,0,0,0.5)]",
      )}
      style={{ bottom: "calc(var(--lm-bottom-nav-height) + 0.5rem)" }}
    >
      <div className="mb-2.5 px-1.5 lm-type-label text-lm-text2">Más secciones</div>
      <MoreLinkItem
        href={LOOKSMAX_PATHS.consejo}
        icon="book-open"
        title="Consejos"
        sub="Guías diarias de looksmaxing"
        onClose={onClose}
      />
      <button
        type="button"
        role="menuitem"
        className={cn(
          "mt-1.5 flex w-full cursor-pointer items-center gap-3 rounded-lg",
          "border border-lm-border bg-[rgba(232,184,75,0.06)] px-1.5 py-2.5 text-left lm-focus-ring",
        )}
        onClick={() => {
          onOpenDiscord();
          onClose();
        }}
      >
        <Icon name="star" size={20} className="text-lm-gold" />
        <div>
          <div className="text-base font-bold text-lm-gold">Unirse a la comunidad</div>
          <div className="text-sm text-lm-text2">Discord exclusivo</div>
        </div>
      </button>
    </div>
  );
}

function MoreLinkItem({
  href,
  icon,
  title,
  sub,
  onClose,
}: {
  href: string;
  icon: IconName;
  title: string;
  sub: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent",
        "px-1.5 py-2.5 text-left no-underline lm-focus-ring transition-colors duration-200",
        "hover:bg-[rgba(232,184,75,0.1)] hover:text-lm-gold2",
      )}
      onClick={onClose}
    >
      <Icon name={icon} size={20} className="text-lm-gold" />
      <div>
        <div className="text-base font-bold text-lm-text">{title}</div>
        <div className="text-sm text-lm-text2">{sub}</div>
      </div>
    </Link>
  );
}
