"use client";

import { AdBanner } from "@/features/rankings/components/AdBanner";
import { Icon, IconLabel } from "@/components/icons";
import { EntryVoteCard } from "@/features/rankings/components/EntryVoteCard";
import { CountdownDigits } from "@/features/shared/components/ui/CountdownDigits";
import { HeroBadge, HeroSection } from "@/features/shared/components/ui/HeroSection";
import { MoversCard } from "@/features/rankings/components/ui/MoversCard";
import { RankRow } from "@/features/rankings/components/ui/RankRow";
import { SectionTitle } from "@/features/shared/components/ui/SectionTitle";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import type { Mover, RankedEntry } from "@/features/rankings/lib/ranking";

type RankingsPageProps = {
  entries: RankedEntry[];
  upMovers: Mover[];
  downMovers: Mover[];
  rankVoteEnd: number | null;
  adsenseClient?: string;
};

export function RankingsPage({
  entries,
  upMovers,
  downMovers,
  rankVoteEnd,
  adsenseClient,
}: RankingsPageProps) {
  const { navigate, openProfile } = useLooksMaxNavigate();
  const cd = useCountdown(rankVoteEnd);

  return (
    <div id="page-rankings" className="block animate-fade-up">
      <HeroSection
        eyebrow="La Comunidad Española de Looksmaxing"
        title={
          <>
            Rankings
            <br />
            LooksMax
          </>
        }
        subtitle="Temporada 2025 · España"
        badges={
          <>
            <HeroBadge>
              <IconLabel icon="timer" iconSize={12}>
                Actualización por Votación
              </IconLabel>
            </HeroBadge>
            <HeroBadge>
              <IconLabel icon="flame" iconSize={12}>
                Datos en tiempo real
              </IconLabel>
            </HeroBadge>
          </>
        }
      />

      <div className="mb-10 mx-auto mt-7 flex flex-wrap items-start justify-center gap-5 px-5 max-md:mt-3 max-md:flex-col max-md:gap-3 max-md:px-4">
        <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
          <button
            type="button"
            className="min-h-[58px] w-full cursor-pointer rounded-[14px] border-none bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))] px-8 py-3 font-display text-[1.3rem] tracking-[2px] text-black shadow-[0_0_24px_rgba(46,204,113,0.35)] lm-focus-ring-on-gold transition-all duration-250 hover:scale-105 max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-[1.05rem]"
            onClick={() => navigate("rankvote")}
          >
            <Icon name="vote" size={18} className="inline text-black" /> VOTAR RANKING
          </button>
          <p className="m-0 text-center text-base leading-snug font-semibold text-lm-text2 max-md:flex-[1.3] max-md:text-left max-md:text-base">
            Elige a tu looksmaxer favorito para que suba en el ranking
          </p>
        </div>
        <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
          <button
            type="button"
            className="min-h-[58px] w-full cursor-pointer rounded-[14px] border-none bg-[linear-gradient(135deg,#ff6b35,var(--color-lm-gold))] px-8 py-3 font-display text-[1.3rem] tracking-[2px] text-black shadow-[0_0_24px_rgba(255,107,53,0.35)] lm-focus-ring-on-gold transition-all duration-250 hover:scale-105 max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-[1.05rem]"
            onClick={() => navigate("torneo")}
          >
            <Icon name="goal" size={18} className="inline text-black" /> TORNEO EN VIVO
          </button>
          <p className="m-0 text-center text-base leading-snug font-semibold text-lm-text2 max-md:flex-[1.3] max-md:text-left max-md:text-base">
            ¡El torneo ha comenzado — vota los partidos!
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[700px] px-5 pt-2 pb-6 max-md:px-4 max-md:pt-1 max-md:pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-lm-border2 bg-[linear-gradient(135deg,rgba(232,184,75,0.06),rgba(232,184,75,0.02))] px-4 py-6 text-center">
          <div className="mb-4 text-sm font-extrabold tracking-[2px] text-lm-text2 uppercase">
            <IconLabel icon="hourglass" iconSize={14} className="justify-center">
              Próxima Actualización del Ranking
            </IconLabel>
          </div>
          <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="gold" />
          <div className="mt-3 text-base font-semibold text-lm-text2">
            El ranking se actualiza automáticamente cuando termina la{" "}
            <span className="text-lm-gold">votación de ranking</span> · Cada 6 horas
          </div>
        </div>
      </div>

      <div
        className="mx-auto mb-6 grid max-w-[1100px] grid-cols-2 gap-3 px-5 max-md:grid-cols-1 max-md:gap-2.5 max-md:px-4"
        id="moversGrid"
      >
        <MoversCard
          title="Mayores Subidas"
          titleIcon="trending-up"
          variant="up"
          movers={upMovers}
        />
        <MoversCard
          title="Últimos Movimientos"
          titleIcon="trending-down"
          variant="down"
          movers={downMovers}
        />
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-12 max-md:px-2.5 max-md:pb-20">
        <SectionTitle className="mb-4">
          <IconLabel icon="trophy" iconSize={20}>
            Ranking Completo
          </IconLabel>
        </SectionTitle>
        <div className="flex flex-col gap-2" id="rankList">
          {entries.map((entry, i) => (
            <RankRow
              key={entry.name}
              entry={entry}
              index={i}
              onOpenProfile={openProfile}
            />
          ))}
        </div>
      </div>

      <AdBanner clientId={adsenseClient} />

      <div className="mx-auto mb-6 flex max-w-[1100px] items-center gap-4 px-5 max-md:flex-col max-md:gap-2 max-md:px-3">
        <div className="h-px flex-1 bg-lm-border max-md:hidden" />
        <div className="text-center text-sm leading-snug font-extrabold tracking-[2px] text-lm-text2 uppercase max-md:max-w-full max-md:text-sm max-md:tracking-[1px] md:whitespace-nowrap">
          <IconLabel
            icon="vote"
            iconSize={12}
            className="justify-center md:justify-start"
          >
            Votación Especial · Próximo Candidato
          </IconLabel>
        </div>
        <div className="h-px flex-1 bg-lm-border max-md:hidden" />
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-16 max-md:px-3 max-md:pb-4">
        <EntryVoteCard />
      </div>
    </div>
  );
}
