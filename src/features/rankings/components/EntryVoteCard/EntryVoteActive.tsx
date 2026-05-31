"use client";

import { CANDIDATES } from "@/features/rankings/data/candidates";
import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import { CountdownDigits } from "@/features/shared/components/ui/CountdownDigits";
import { entryVoteCardShellClass } from "./shell-styles";
import { cn } from "@/lib/cn";

export function EntryVoteActive({
  cd,
  votes,
  total,
  voted,
  myCandidateId,
  voting,
  onVote,
}: {
  cd: { h: string; m: string; s: string };
  votes: Record<string, number> | undefined;
  total: number;
  voted: boolean;
  myCandidateId: string | undefined;
  voting: boolean;
  onVote: (id: string) => void;
}) {
  return (
    <div className={entryVoteCardShellClass} id="entryVotingCard">
      <div
        className={cn(
          "mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1",
          "lm-type-label text-lm-purple max-md:text-sm",
        )}
      >
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
        VOTACIÓN ABIERTA · CIERRA EN 2 HORAS
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
      </div>
      <h2
        className={cn(
          "mx-auto mb-1 w-fit max-w-full bg-clip-text",
          "bg-[linear-gradient(135deg,#fff_0%,#c084fc_60%,var(--color-lm-purple)_100%)]",
          "font-display text-[clamp(1.5rem,4vw,3rem)] tracking-[3px] text-transparent",
        )}
      >
        ¿Quién entra al Ranking?
      </h2>
      <div className="mb-6 text-base font-semibold text-lm-text2">
        Haz clic directamente en el candidato para votar · Un voto por dispositivo e IP
        · El que más votos tenga entra al ranking
      </div>
      <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="purple" className="mb-6" />
      <div
        className="mx-auto mb-6 grid max-w-[600px] grid-cols-2 gap-4 max-md:gap-2.5"
        id="evCandidatesGrid"
      >
        {CANDIDATES.map((c) => {
          const voteCount = votes?.[c.id] ?? 0;
          const pct = Math.round((voteCount / total) * 100);
          const isSel = voted && myCandidateId === c.id;
          return (
            <div
              key={c.id}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-[14px]",
                "border border-lm-border bg-lm-card p-5 transition-all duration-300",
                "max-md:rounded-xl max-md:p-3.5",
                !voted && "hover:-translate-y-0.5 hover:border-[rgba(168,85,247,0.5)]",
                isSel &&
                  cn(
                    "-translate-y-0.5 border-lm-purple bg-[rgba(168,85,247,0.15)]",
                    "shadow-[0_0_24px_rgba(168,85,247,0.3)]",
                  ),
              )}
              data-id={c.id}
              role={!voted ? "button" : undefined}
              tabIndex={!voted ? 0 : undefined}
              onClick={() => !voted && !voting && onVote(c.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && !voted && !voting && onVote(c.id)
              }
            >
              {isSel && (
                <Icon
                  name="check"
                  size={16}
                  className="absolute top-2.5 right-2.5 text-lm-purple"
                />
              )}
              <div
                className={cn(
                  "relative mx-auto mb-2.5 h-[70px] w-[70px] overflow-hidden rounded-full",
                  "border-2 border-lm-border bg-lm-bg3",
                )}
              >
                <CreatorImage
                  src={c.photo}
                  alt={c.name}
                  className="rounded-full object-cover"
                  sizes="70px"
                  fallback={<CreatorIcon name={c.name} icon={c.icon} size={28} />}
                />
              </div>
              <div className="mb-0.5 font-sans text-lg font-bold tracking-tight text-lm-text">
                {c.name}
              </div>
              <div className="mb-3 text-sm font-semibold text-lm-text2">{c.sub}</div>
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-800",
                    "bg-[linear-gradient(90deg,var(--color-lm-purple),#c084fc)]",
                  )}
                  style={{ width: voted ? `${pct}%` : "0%" }}
                />
              </div>
              <div className="text-base font-bold text-lm-purple">
                {voted ? (
                  `${pct}%`
                ) : (
                  <IconLabel icon="pointer" iconSize={12} className="justify-center">
                    Clic para votar
                  </IconLabel>
                )}
              </div>
              <div className="text-sm font-semibold text-lm-text2">
                {voted ? `${voteCount} voto${voteCount !== 1 ? "s" : ""}` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div id="evAction">
        {voted ? (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-base font-bold text-lm-green2">
            <Icon name="circle-check" size={16} />
            Has votado por{" "}
            <strong>
              {CANDIDATES.find((c) => c.id === myCandidateId)?.name ?? "—"}
            </strong>
          </div>
        ) : (
          <div className="text-sm font-semibold text-lm-text2">
            <IconLabel icon="pointer" iconSize={12} className="justify-center">
              Solo puedes votar una vez · El ganador entra al ranking
            </IconLabel>
          </div>
        )}
      </div>
    </div>
  );
}
