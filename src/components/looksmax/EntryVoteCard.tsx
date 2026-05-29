"use client";

import { useMemo } from "react";
import { CANDIDATES } from "@/data/candidates";
import { CountdownDigits } from "@/components/looksmax/ui/CountdownDigits";
import { useCountdown } from "@/hooks/useCountdown";
import { useEntryVote } from "@/hooks/useEntryVote";
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
        <div className="px-6 py-8 text-center text-lm-text2">⏳ Cargando votación…</div>
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
          <div className="animate-fade-up mb-3 flex justify-center gap-2 text-2xl">🎉 🏆 🎊 ✨ 🎉</div>
          <div className="mb-3 flex items-center justify-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[3px] text-lm-gold">
            <span>★</span> VOTACIÓN CERRADA <span>★</span>
          </div>
          <div className="animate-hero-entrance font-display mb-2 text-[clamp(2rem,6vw,5rem)] tracking-[4px] bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text text-transparent">
            GANADOR
          </div>
          <div className="animate-hero-entrance font-display text-[clamp(2.5rem,8vw,7rem)] leading-none tracking-[3px] bg-[linear-gradient(135deg,var(--color-lm-gold2),var(--color-lm-gold),#fff)] bg-clip-text text-transparent">
            {winnerC?.name ?? ev.winner}
          </div>
          <div className="animate-winner-pop mx-auto my-5 flex h-[130px] w-[130px] items-center justify-center overflow-hidden rounded-full border-[3px] border-lm-gold bg-lm-card2 text-[3.5rem] shadow-[0_0_40px_rgba(232,184,75,0.4)]">
            {winnerC?.photo ? (
              <img
                src={winnerC.photo}
                alt={winnerC.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-[3rem]">{winnerC?.emoji ?? "🏆"}</span>
            )}
          </div>
          <div className="mt-4 text-[0.75rem] font-semibold text-lm-text2">
            🏆 Esta persona será añadida al ranking en la próxima actualización
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
      <div className="mb-2 flex items-center justify-center gap-2 text-[0.65rem] font-extrabold uppercase tracking-[2px] text-lm-purple">
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
        VOTACIÓN ABIERTA · CIERRA VIERNES 29 MAYO 22:30
        <div className="h-[7px] w-[7px] animate-pulse-soft rounded-full bg-lm-purple" />
      </div>
      <div className="font-display mb-1 text-[clamp(1.5rem,4vw,3rem)] tracking-[3px] bg-[linear-gradient(135deg,#fff_0%,#c084fc_60%,var(--color-lm-purple)_100%)] bg-clip-text text-transparent">
        ¿Quién entra al Ranking?
      </div>
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
                  "border-lm-purple bg-[rgba(168,85,247,0.15)] shadow-[0_0_24px_rgba(168,85,247,0.3)] -translate-y-0.5 after:absolute after:right-2.5 after:top-2.5 after:text-base after:font-black after:text-lm-purple after:content-['✓']",
              )}
              data-id={c.id}
              role={!voted ? "button" : undefined}
              tabIndex={!voted ? 0 : undefined}
              onClick={() => !voted && !voting && void vote(c.id)}
              onKeyDown={(e) =>
                e.key === "Enter" && !voted && !voting && void vote(c.id)
              }
            >
              <div className="mx-auto mb-2.5 flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg3 text-[1.8rem]">
                <img
                  src={c.photo}
                  alt={c.name}
                  className="h-full w-full rounded-full object-cover"
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
                {voted ? `${pct}%` : "👆 Clic para votar"}
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
            ✅ Has votado por{" "}
            <strong>{CANDIDATES.find((c) => c.id === myVote?.candidate)?.name ?? "—"}</strong>
          </div>
        ) : (
          <div className="text-[0.65rem] font-semibold text-lm-text2">
            👆 Solo puedes votar una vez · El ganador entra al ranking
          </div>
        )}
      </div>
    </div>
  );
}
