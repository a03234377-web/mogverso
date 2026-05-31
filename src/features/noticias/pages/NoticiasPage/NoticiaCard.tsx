import { Icon } from "@/components/icons";
import type { IconName } from "@/types/icons";
import { cn } from "@/lib/cn";

export function NoticiaCard({
  cat,
  catIcon,
  catLabel,
  title,
  body,
  tag,
  time,
}: {
  cat: string;
  catIcon: IconName;
  catLabel: string;
  title: string;
  body: string;
  tag: string;
  time: string;
}) {
  return (
    <div className="rounded-xl border border-lm-border bg-lm-card p-4">
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1 lm-type-label",
          `noticia-cat--${cat}`,
        )}
      >
        <Icon name={catIcon} size={12} />
        {catLabel}
      </div>
      <div className="mb-1.5 text-base leading-snug font-bold">{title}</div>
      <div className="font-serif text-base leading-normal text-lm-text2">{body}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-sm font-semibold text-lm-text2">
        <span className="rounded-full border border-lm-border bg-lm-bg3 px-1.5 py-0.5 text-sm font-bold">
          {tag}
        </span>
        <span>{time}</span>
      </div>
    </div>
  );
}
