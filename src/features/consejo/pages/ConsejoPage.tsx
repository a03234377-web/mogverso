"use client";

import { PageHeader } from "@/components/PageHeader";
import { ActivePage } from "@/components/ui/ActivePage";
import { Icon } from "@/components/icons";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";
import {
  consejoDelDia,
  consejos,
  type ConsejoCategory,
} from "@/features/consejo/data/consejos";

export function ConsejoPage() {
  return (
    <ActivePage id="page-consejo" active>
      <PageHeader
        icon="book-open"
        title="Consejos"
        desc="Protocolos prácticos de looksmaxing: piel, cuerpo, estilo y hábitos que se notan en cámara"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-12 max-md:px-3 max-md:pb-6">
        <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1 max-md:gap-2.5">
          <ConsejoDestacado
            title={consejoDelDia.title}
            body={consejoDelDia.body}
            tags={consejoDelDia.tags}
          />
          {consejos.map((item) => (
            <ConsejoCard
              key={item.id}
              category={item.category}
              catIcon={item.catIcon}
              catLabel={item.catLabel}
              title={item.title}
              body={item.body}
              tag={item.tag}
            />
          ))}
        </div>
      </div>
    </ActivePage>
  );
}

function ConsejoDestacado({
  title,
  body,
  tags,
}: {
  title: string;
  body: string;
  tags: string[];
}) {
  return (
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
          Consejo del día
        </div>
        <h3 className="mb-1.5 font-sans text-lg leading-snug font-bold text-lm-text">
          {title}
        </h3>
        <p className="font-serif text-base leading-relaxed text-lm-text2">{body}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-sm text-lm-text2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConsejoCard({
  category,
  catIcon,
  catLabel,
  title,
  body,
  tag,
}: {
  category: ConsejoCategory;
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
          `consejo-cat--${category}`,
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
