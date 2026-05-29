"use client";

import { useMemo } from "react";
import { CANDIDATES } from "@/features/looksmax/data/candidates";
import { CreatorImage } from "@/features/looksmax/components/CreatorImage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import { CountdownDigits } from "@/features/looksmax/components/ui/CountdownDigits";
import { useCountdown } from "@/features/looksmax/hooks/useCountdown";
import { useEntryVote } from "@/features/looksmax/hooks/useEntryVote";
import { cn } from "@/lib/cn";

export function EntryVoteCard() {
  const { ev, myVote, vote, voting } = useEntryVote();
  const cd = useCountdown(ev?.endTime);

  const voted = myVote && ev && myVote.evId === ev.id;
  const total = useMemo(
    () => Math.max(1, CANDIDATES.reduce((s, c) => s + (ev?.votes?.[c.id] ?? 0), 0)),
    [ev],
  );

  if (!ev) {
    return (
      <div
        className="relative overflow-hidden rounded-[20px] border border-[rgba(168,85,247,0.35)] bg-[linear-gradient(135deg,rgba(168,85,247,0.08),rgba(59,130,246,0.05))] px-6 py-8 text-center max-md:rounded-2xl max-md:px-3.5 max-md:py-5"
        id="entryVotingCard"
      >
        <div className="flex items-center justify-center gap-2 px-6 py-8 text-lm-text2">
          <Icon name="hourglass" size={18} className="text-lm-purple" />
          Cargando votación…
        </div>
      </div>
    );
  }

  if (ev.winner) {
    const winnerC = CANDIDATES.find((c) => c.id === ev.winner);
    return (
      <div
        className="relative overflow-hidden rounded-[20px] border border-[rgba(168,85,247,0.35)] bg-[linear-gradient(135deg,rgba(168,85,247,0.08),rgba(59,130,246,0.05))] px-6 py-8 text-center max-md:rounded-2xl max-md:px-3.5 max-md:py-5"
        id="entryVotingCard"
      >
        <div className="px-4 py-8 text-center">
          <div className="animate-fade-up mb-3 flex justify-center gap-3 text-lm-gold">
            <Icon name="party-popper" size={24} />
            <Icon name="trophy" size={24} />
            <Icon name="sparkles" size={24} />
          </div>
          <div className="mb-3 flex items-center justify-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[3px] text-lm-gold">
            <Icon name="star" size={12} /> VOTACIÓN CERRADA <Icon name="star" size={12} />
          </div>
          <h2 className="animate-hero-entrance font-display mx-auto mb-2 w-fit max-w-full text-[clamp(2rem,6vw,5rem)] tracking-[4px] bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text text-transparent">
            GANADOR
          </h2>
          <h2 className="animate-hero-entrance font-display mx-auto w-fit max-w-full text-[clamp(2.5rem,8vw,7rem)] tracking-[3px] bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold),#fff)] bg-clip-text text-transparent">
            {winnerC?.name ?? ev.winner}
          </h2>
          <div className="animate-winner-pop mx-auto my-5 flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full border-[3px] border-lm-gold bg-lm-card2 shadow-[0_0_40px_rgba(232,184,75,0.4)]">
            <CreatorImage
              src={winnerC?.photo ?? ""}
              alt={winnerC?.name ?? "Ganador"}
              className="h-full w-full rounded-full object-cover"
              fallback={
                <CreatorIcon
                  name={winnerC?.name ?? ""}
                  icon={winnerC?.icon ?? "trophy"}
                  size={48}
                  className="text-lm-gold"
                />
              }
            />
          </div>
          <div className="mt-4 text-[0.75rem] font-semibold text-lm-text2">
            <IconLabel icon="trophy" iconSize={14} className="justify-center">
              Esta persona será añadida al ranking en la próxima actualización
            </IconLabel>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-[rgba(168,85,247,0.35)] bg-[linear-gradient(135deg,rgba(168,85,247,0.08),rgba(59,130,246,0.05))] px-6 py-8 text-center max-md:rounded-2xl max-md:px-3.5 max-md:py-5"
      id="entryVotingCard"
    >
      <div className="mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.65rem] font-extrabold uppercase tracking-[2px] text-lm-purple max-md:text-[0.55rem] max-md:tracking-[1px]">
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
        VOTACIÓN ABIERTA · CIERRA VIERNES 29 MAYO 22:30
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
      </div>
      <h2 className="font-display mx-auto mb-1 w-fit max-w-full text-[clamp(1.5rem,4vw,3rem)] tracking-[3px] bg-[linear-gradient(135deg,#fff_0%,#c084fc_60%,var(--color-lm-purple)_100%)] bg-clip-text text-transparent">
        ¿Quién entra al Ranking?
      </h2>
      <div className="mb-6 text-[0.78rem] font-semibold text-lm-text2">
        Haz clic directamente en el candidato para votar · Un voto por dispositivo e IP
      </div>
      <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="purple" className="mb-6" />
      <div className="mx-auto mb-6 grid max-w-[600px] grid-cols-2 gap-4 max-md:gap-2.5" id="evCandidatesGrid">
        {CANDIDATES.map((c) => {
          const votes = ev.votes?.[c.id] ?? 0;
          const pct = Math.round((votes / total) * 100);
          const isSel = voted && myVote?.candidate === c.id;
          return (
            <div
              key={c.id}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-[14px] border border-lm-border bg-lm-card p-5 transition-all duration-300 max-md:rounded-xl max-md:p-3.5",
                !voted && "hover:-translate-y-0.5 hover:border-[rgba(168,85,247,0.5)]",
                isSel &&
                  "border-lm-purple bg-[rgba(168,85,247,0.15)] shadow-[0_0_24px_rgba(168,85,247,0.3)] -translate-y-0.5",
              )}
              data-id={c.id}
              role={!voted ? "button" : undefined}
              tabIndex={!voted ? 0 : undefined}
              onClick={() => !voted && !voting && void vote(c.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && !voted && !voting && void vote(c.id)
              }
            >
              {isSel && (
                <Icon
                  name="check"
                  size={16}
                  className="absolute right-2.5 top-2.5 text-lm-purple"
                />
              )}
              <div className="mx-auto mb-2.5 flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg3">
                <CreatorImage
                  src={c.photo}
                  alt={c.name}
                  className="h-full w-full rounded-full object-cover"
                  fallback={<CreatorIcon name={c.name} icon={c.icon} size={28} />}
                />
              </div>
              <div className="font-display mb-0.5 text-[1.2rem] tracking-[1.5px] text-lm-text">
                {c.name}
              </div>
              <div className="mb-3 text-[0.65rem] font-semibold text-lm-text2">{c.sub}</div>
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-lm-purple),#c084fc)] transition-[width] duration-800"
                  style={{ width: voted ? `${pct}%` : "0%" }}
                />
              </div>
              <div className="text-[0.7rem] font-extrabold text-lm-purple">
                {voted ? (
                  `${pct}%`
                ) : (
                  <IconLabel icon="pointer" iconSize={12} className="justify-center">
                    Clic para votar
                  </IconLabel>
                )}
              </div>
              <div className="text-[0.6rem] font-semibold text-lm-text2">
                {voted ? `${votes} voto${votes !== 1 ? "s" : ""}` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div id="evAction">
        {voted ? (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.8rem] font-bold text-lm-green2">
            <Icon name="circle-check" size={16} />
            Has votado por{" "}
            <strong>{CANDIDATES.find((c) => c.id === myVote?.candidate)?.name ?? "—"}</strong>
          </div>
        ) : (
          <div className="text-[0.65rem] font-semibold text-lm-text2">
            <IconLabel icon="pointer" iconSize={12} className="justify-center">
              Solo puedes votar una vez · El ganador entra al ranking
            </IconLabel>
          </div>
        )}
      </div>
    </div>
  );
}
