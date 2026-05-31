"use client";

import { Icon, IconLabel } from "@/components/icons";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { HeroSection } from "@/features/shared/components/ui/HeroSection";
import { RankVoteArena } from "./RankVoteArena";
import { HistoryRow } from "./HistoryRow";
import { useRankVote } from "@/features/rankvote/hooks/useRankVote";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function RankVotePage() {
  const { fb } = useFirebase();
  const {
    rv,
    myVote,
    overrides,
    history,
    loading,
    transitioning,
    healError,
    voting,
    vote,
    retryHeal,
  } = useRankVote(true);

  return (
    <ActivePage id="page-rankvote" active>
      <HeroSection
        variant="rankvote"
        title={
          <>
            <IconLabel icon="vote" iconSize={28} className="justify-center">
              Votar
            </IconLabel>
            <br />
            Ranking
          </>
        }
        subtitle="Vota cada 3 horas · El ganador sube 1 puesto · El perdedor baja 1 puesto"
      />
      <div className="mx-auto max-w-[1000px] px-5 pb-16 max-md:px-3 max-md:pb-[5.5rem]">
        <div
          className={cn(
            "relative mb-8 overflow-hidden rounded-[20px]",
            "border border-[rgba(46,204,113,0.3)]",
            "bg-[linear-gradient(135deg,rgba(46,204,113,0.07),rgba(232,184,75,0.04))]",
            "px-6 py-8 text-center max-md:mb-5 max-md:rounded-2xl max-md:px-3.5 max-md:py-5",
          )}
          id="rankvoteArena"
        >
          {loading || transitioning ? (
            <div className="px-6 py-12 text-center text-base font-bold text-lm-gold">
              <div
                className={cn(
                  "mx-auto mb-4 h-8 w-8 animate-spin-slow rounded-full border-[3px]",
                  "border-[rgba(232,184,75,0.2)] border-t-lm-gold",
                )}
              />
              {transitioning ? (
                <IconLabel icon="circle-check" iconSize={16} className="justify-center">
                  Ronda resuelta · Cargando nueva votación…
                </IconLabel>
              ) : (
                <IconLabel icon="hourglass" iconSize={16} className="justify-center">
                  Cargando votación…
                </IconLabel>
              )}
              {healError && (
                <div className="mx-auto mt-4 max-w-md text-sm leading-relaxed font-semibold text-lm-red2">
                  {healError}
                  <button
                    type="button"
                    className={cn(
                      "mt-3 block w-full cursor-pointer rounded-lg border border-lm-border2",
                      "bg-lm-card px-4 py-2 text-sm font-bold text-lm-gold lm-focus-ring",
                    )}
                    onClick={() => void retryHeal()}
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          ) : rv ? (
            <RankVoteArena
              rv={rv}
              myVote={myVote}
              overrides={overrides}
              fb={fb}
              voting={voting}
              onVote={(name) => void vote(name)}
            />
          ) : (
            <div className="flex items-center justify-center gap-2 px-6 py-12 text-center text-lm-text2">
              <Icon name="hourglass" size={16} />
              Cargando votación…
            </div>
          )}
        </div>
        <div>
          <div className="mb-4 flex items-center gap-2 font-sans text-xl font-bold tracking-tight text-lm-text">
            <Icon name="scroll-text" size={22} className="text-lm-gold" />
            Historial de Votaciones
          </div>
          <div id="rankvoteHistoryList">
            {history.length === 0 ? (
              <div className="px-6 py-6 text-center text-base text-lm-text2">
                No hay votaciones resueltas aún · ¡Participa en la primera!
              </div>
            ) : (
              history.map((h) => (
                <HistoryRow
                  key={h.id ?? `${h.ts}-${h.winner}-${h.loser}-${h.wVotes}-${h.lVotes}`}
                  h={h}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </ActivePage>
  );
}
