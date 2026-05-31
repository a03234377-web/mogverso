"use client";

import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import { getRankerPhoto } from "@/features/rankings/data/avatars";
import { RANKERS } from "@/features/rankings/data/rankers";
import { cn } from "@/lib/cn";

export function FighterCard({
  side,
  name,
  photoName,
  ranker,
  idx,
  pct,
  votes,
  voted,
  canVote,
  selected,
  onVote,
}: {
  side: "up" | "down";
  name: string;
  /** Nombre canónico para resolver la foto (p. ej. clave Firebase). */
  photoName: string;
  ranker: { sub: string; score: number };
  idx: number;
  pct: number;
  votes: number;
  voted: boolean;
  canVote: boolean;
  selected: boolean;
  onVote: () => void;
}) {
  const up = side === "up";
  const photo = getRankerPhoto(photoName);

  return (
    <button
      type="button"
      disabled={!canVote}
      aria-label={`Votar ${up ? "subir" : "bajar"} a ${name}`}
      aria-pressed={selected}
      className={cn(
        "relative block w-full overflow-hidden rounded-2xl border-2 border-lm-border bg-lm-card",
        "px-4 py-5 text-center lm-focus-ring transition-all duration-250",
        "max-[400px]:px-1.5 max-[400px]:py-2.5 max-md:rounded-xl max-md:px-2 max-md:py-3.5",
        !canVote && "lm-vote-disabled cursor-not-allowed",
        canVote &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        canVote &&
          up &&
          "hover:border-[rgba(46,204,113,0.7)] hover:bg-[rgba(46,204,113,0.07)]",
        canVote &&
          !up &&
          "hover:border-[rgba(255,71,87,0.7)] hover:bg-[rgba(255,71,87,0.07)]",
        selected &&
          up &&
          "-translate-y-1 border-lm-green2 bg-[rgba(46,204,113,0.13)] shadow-[0_0_28px_rgba(46,204,113,0.25)]",
        selected &&
          !up &&
          "-translate-y-1 border-lm-red2 bg-[rgba(255,71,87,0.13)] shadow-[0_0_28px_rgba(255,71,87,0.2)]",
      )}
      onClick={() => onVote()}
    >
      {selected && (
        <Icon
          name="check"
          size={18}
          className={cn(
            "absolute top-2.5 right-2.5",
            up ? "text-lm-green2" : "text-lm-red2",
          )}
        />
      )}
      <div
        className={cn(
          "relative mx-auto mb-2 size-20 shrink-0 overflow-hidden rounded-full",
          "border-2 border-lm-border bg-lm-bg3",
          "max-[400px]:size-[54px] max-md:size-16",
        )}
      >
        {photo ? (
          <CreatorImage
            src={photo}
            alt={name}
            className="rounded-full object-contain object-center"
            sizes="80px"
            fallback={
              <span className="flex size-full items-center justify-center">
                <CreatorIcon name={photoName} size={36} />
              </span>
            }
          />
        ) : (
          <span className="flex size-full items-center justify-center">
            <CreatorIcon name={photoName} size={36} className="max-[400px]:scale-90" />
          </span>
        )}
      </div>
      <div
        className={cn(
          "mb-0.5 font-sans text-lg font-bold tracking-tight max-md:text-lg",
          up ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        {name}
      </div>
      <div className="mb-1 text-base font-semibold text-lm-text2">{ranker.sub}</div>
      <div className="mb-2 font-sans text-base font-semibold text-lm-gold">
        Puesto #{idx} · Score {ranker.score}
      </div>
      <div
        className={cn(
          "mb-2 inline-block rounded-full px-2 py-0.5 font-sans text-sm font-semibold",
          up
            ? "border border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.15)] text-lm-green2"
            : "border border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.15)] text-lm-red2",
        )}
      >
        {up ? "▲" : "▼"} {up ? "Gana" : "Pierde"} → #
        {up ? Math.max(1, idx - 1) : Math.min(RANKERS.length, idx + 1)}
      </div>
      <div className="mb-1 h-[5px] overflow-hidden rounded-full bg-white/6">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-800",
            up
              ? "bg-[linear-gradient(90deg,var(--color-lm-green2),#52f0a8)]"
              : "bg-[linear-gradient(90deg,var(--color-lm-red2),#ff8c69)]",
          )}
          style={{ width: voted ? `${pct}%` : "0%" }}
        />
      </div>
      <div
        className={cn(
          "font-sans text-base font-semibold",
          up ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        {voted ? (
          `${pct}%`
        ) : canVote ? (
          <IconLabel icon="pointer" iconSize={12} className="justify-center">
            Votar
          </IconLabel>
        ) : (
          "—"
        )}
      </div>
      <div className="text-base font-semibold text-lm-text2">
        {voted ? `${votes} voto${votes !== 1 ? "s" : ""}` : ""}
      </div>
    </button>
  );
}
