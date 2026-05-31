"use client";

import { Icon } from "@/components/icons";
import { NoticiaTextWithProfiles } from "@/features/noticias/lib/linkify-noticia-text";
import { noticiaKindLabelClass } from "@/features/noticias/lib/noticia-kind-colors";
import type { NoticiaEventKind } from "@/features/noticias/lib/noticia-event";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export function NoticiaCard({
  kind,
  catIcon,
  catLabel,
  title,
  body,
  tag,
  time,
  profileNames,
}: {
  kind: NoticiaEventKind;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
  time: string;
  profileNames: string[];
}) {
  const labelClass = noticiaKindLabelClass(kind);

  return (
    <div className="rounded-xl border border-lm-border bg-lm-card p-4">
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1 lm-type-label",
          labelClass,
        )}
      >
        <Icon name={catIcon} size={12} />
        {catLabel}
      </div>
      <div className="mb-1.5 text-base leading-snug font-bold text-lm-text">
        <NoticiaTextWithProfiles
          text={title}
          profileNames={profileNames}
          linkClassName="text-lm-gold hover:text-lm-gold2"
        />
      </div>
      <div className="font-serif text-base leading-normal text-lm-text2">
        <NoticiaTextWithProfiles
          text={body}
          profileNames={profileNames}
          linkClassName="text-lm-text hover:text-lm-text"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-sm font-semibold text-lm-text2">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold">
          {tag}
        </span>
        <span>{time}</span>
      </div>
    </div>
  );
}
