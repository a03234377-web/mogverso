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
          className="lm-global-ann relative z-[200] flex animate-fade-up items-center justify-center px-8 py-5 backdrop-blur-xl max-md:px-12 max-md:py-4"
          style={{
            background: ann.bg,
            borderBottom: `2px solid ${ann.border}`,
          }}
        >
          <div className="flex w-full min-w-0 items-baseline justify-center gap-3 text-center max-md:gap-2">
            <Icon
              name={ann.icon}
              size={32}
              className="relative top-[0.08em] shrink-0 text-lm-gold max-md:h-6 max-md:w-6"
            />
            <span className="min-w-0 text-[1.35rem] leading-snug font-black tracking-wide text-lm-text max-md:text-base">
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
      className="ann-close absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center rounded-md border-none bg-transparent p-1 text-lm-text2 lm-focus-ring max-md:right-2"
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
