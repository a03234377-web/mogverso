"use client";

import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import type { EntryCandidate } from "@/features/rankings/data/candidates";
import { entryVoteCardShellClass } from "./shell-styles";
import { cn } from "@/lib/cn";

export function EntryVoteWinner({
  winnerId,
  winnerC,
}: {
  winnerId: string;
  winnerC?: EntryCandidate;
}) {
  return (
    <div className={entryVoteCardShellClass} id="entryVotingCard">
      <div className="px-4 py-8 text-center">
        <div className="mb-3 flex animate-fade-up justify-center gap-3 text-lm-gold">
          <Icon name="party-popper" size={24} />
          <Icon name="trophy" size={24} />
          <Icon name="sparkles" size={24} />
        </div>
        <div className="mb-3 flex items-center justify-center gap-2 lm-type-label text-lm-gold">
          <Icon name="star" size={12} /> VOTACIÓN CERRADA <Icon name="star" size={12} />
        </div>
        <h2
          className={cn(
            "mx-auto mb-2 w-fit max-w-full animate-hero-entrance bg-clip-text",
            "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))]",
            "font-display text-[clamp(2rem,6vw,5rem)] tracking-[4px] text-transparent",
          )}
        >
          GANADOR
        </h2>
        <h2
          className={cn(
            "mx-auto w-fit max-w-full animate-hero-entrance bg-clip-text",
            "bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold),#fff)]",
            "font-display text-[clamp(2.5rem,8vw,7rem)] tracking-[3px] text-transparent",
          )}
        >
          {winnerC?.name ?? winnerId}
        </h2>
        <div
          className={cn(
            "relative mx-auto my-5 h-[130px] w-[130px] animate-winner-pop overflow-hidden",
            "rounded-full border-[3px] border-lm-gold bg-lm-card2",
            "shadow-[0_0_40px_rgba(232,184,75,0.4)]",
          )}
        >
          {winnerC?.photo ? (
            <CreatorImage
              src={winnerC.photo}
              alt={winnerC.name}
              className="rounded-full object-cover"
              sizes="130px"
              fallback={
                <CreatorIcon
                  name={winnerC.name}
                  icon={winnerC.icon}
                  size={48}
                  className="text-lm-gold"
                />
              }
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <CreatorIcon
                name={winnerC?.name ?? ""}
                icon={winnerC?.icon ?? "trophy"}
                size={48}
                className="text-lm-gold"
              />
            </span>
          )}
        </div>
        <div className="mt-4 text-base font-semibold text-lm-text2">
          <IconLabel icon="trophy" iconSize={14} className="justify-center">
            Esta persona será añadida al ranking en la próxima actualización
          </IconLabel>
        </div>
      </div>
    </div>
  );
}
