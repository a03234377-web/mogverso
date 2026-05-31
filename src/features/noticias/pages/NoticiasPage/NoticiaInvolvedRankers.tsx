"use client";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/icons";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import type { NoticiaEventKind } from "@/features/noticias/lib/noticia-event";
import { cn } from "@/lib/cn";

type RankerChipVariant = "up" | "down" | "win" | "lose" | "champion" | "neutral";

function chipBorderClass(variant: RankerChipVariant): string {
  switch (variant) {
    case "up":
    case "win":
      return "border-lm-green2 shadow-[0_0_10px_rgba(46,204,113,0.25)]";
    case "down":
    case "lose":
      return "border-lm-red2 shadow-[0_0_10px_rgba(255,71,87,0.2)]";
    case "champion":
      return "border-lm-gold2 shadow-[0_0_12px_rgba(232,184,75,0.3)]";
    default:
      return "border-lm-border2";
  }
}

function NoticiaRankerChip({
  name,
  variant,
}: {
  name: string;
  variant: RankerChipVariant;
}) {
  return (
    <div className="flex max-w-[96px] min-w-0 flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 bg-lm-bg3 p-0.5",
          chipBorderClass(variant),
        )}
      >
        <Avatar name={name} size={40} fit="contain" />
      </div>
      <RankerProfileLink
        name={name}
        from="noticias"
        className={cn(
          "w-full truncate text-center text-xs leading-tight font-bold",
          variant === "win" || variant === "up"
            ? "text-lm-green2"
            : variant === "lose" || variant === "down"
              ? "text-lm-red2"
              : variant === "champion"
                ? "text-lm-gold"
                : "text-lm-text",
        )}
      />
    </div>
  );
}

function variantForSingle(kind: NoticiaEventKind): RankerChipVariant {
  if (kind === "subida") return "up";
  if (kind === "bajada") return "down";
  if (kind === "torneo") return "champion";
  return "neutral";
}

export function NoticiaInvolvedRankers({
  kind,
  profileNames,
}: {
  kind: NoticiaEventKind;
  profileNames: string[];
}) {
  const names = profileNames.filter(Boolean);
  if (names.length === 0) return null;

  if (names.length === 1) {
    return (
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border-2 bg-lm-bg3 p-0.5",
            chipBorderClass(variantForSingle(kind)),
          )}
        >
          <Avatar name={names[0]} size={44} fit="contain" />
        </div>
        <RankerProfileLink
          name={names[0]}
          from="noticias"
          className={cn(
            "min-w-0 truncate text-sm font-bold",
            kind === "subida"
              ? "text-lm-green2"
              : kind === "bajada"
                ? "text-lm-red2"
                : kind === "torneo"
                  ? "text-lm-gold"
                  : "text-lm-text",
          )}
        />
      </div>
    );
  }

  const [first, second] = names;
  const firstVariant: RankerChipVariant = kind === "rankvote" ? "win" : "neutral";
  const secondVariant: RankerChipVariant = kind === "rankvote" ? "lose" : "neutral";

  return (
    <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
      <NoticiaRankerChip name={first} variant={firstVariant} />
      <div
        className="flex shrink-0 flex-col items-center gap-0.5 px-0.5 text-lm-text2"
        aria-hidden
      >
        <Icon name="vote" size={14} className="text-lm-gold opacity-80" />
        <span className="text-[10px] font-bold tracking-wider uppercase">vs</span>
      </div>
      <NoticiaRankerChip name={second} variant={secondVariant} />
    </div>
  );
}
