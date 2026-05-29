"use client";

import { Icon } from "@/components/icons";
import type { Announcement } from "@/lib/firebase/client";

export function GlobalAnnouncements({ items }: { items: Announcement[] }) {
  if (!items.length) return null;

  return (
    <>
      {items.map((ann, i) => (
        <div
          key={`${ann.type}-${i}`}
          className="lm-global-ann relative z-[200] flex animate-fade-up items-center justify-center px-8 py-5 backdrop-blur-xl max-md:px-4"
          style={{
            background: ann.bg,
            borderBottom: `2px solid ${ann.border}`,
          }}
        >
          <div className="flex w-full items-center justify-center gap-4 text-center">
            <Icon name={ann.icon} size={32} className="text-lm-gold" />
            <span className="text-[1.35rem] font-black leading-snug tracking-wide text-lm-text">
              {ann.text}
            </span>
          </div>
          <DismissButton />
        </div>
      ))}
    </>
  );
}

function DismissButton() {
  return (
    <button
      type="button"
      className="lm-focus-ring ann-close absolute right-[18px] top-1/2 flex -translate-y-1/2 cursor-pointer items-center rounded-md border-none bg-transparent p-1 text-lm-text2"
      onClick={(e) => {
        const el = e.currentTarget.closest(".lm-global-ann");
        el?.remove();
      }}
      aria-label="Cerrar anuncio"
    >
      <Icon name="x" size={22} />
    </button>
  );
}
