"use client";

import { AdBanner } from "@/components/looksmax/AdBanner";
import { EntryVoteCard } from "@/components/looksmax/EntryVoteCard";
import { CountdownDigits } from "@/components/looksmax/ui/CountdownDigits";
import { HeroBadge, HeroSection } from "@/components/looksmax/ui/HeroSection";
import { MoversCard } from "@/components/looksmax/ui/MoversCard";
import { RankRow } from "@/components/looksmax/ui/RankRow";
import { SectionTitle } from "@/components/looksmax/ui/SectionTitle";
import type { NavigationProps } from "@/components/looksmax/types";
import { useCountdown } from "@/hooks/useCountdown";
import type { Mover, RankedEntry } from "@/lib/looksmax/ranking";

type RankingsPageProps = NavigationProps & {
  entries: RankedEntry[];
  upMovers: Mover[];
  downMovers: Mover[];
  rankVoteEnd: number | null;
  onOpenProfile: (originalIndex: number, rank: number) => void;
  adsenseClient?: string;
};

export function RankingsPage({
  entries,
  upMovers,
  downMovers,
  rankVoteEnd,
  onNavigate,
  onOpenProfile,
  adsenseClient,
}: RankingsPageProps) {
  const cd = useCountdown(rankVoteEnd);

  return (
    <div id="page-rankings" className="block animate-fade-up">
      <HeroSection
        eyebrow="🇪🇸 La Comunidad Española de Looksmaxing"
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
            <HeroBadge>⏱ Actualización por Votación</HeroBadge>
            <HeroBadge>🔥 Datos en tiempo real</HeroBadge>
          </>
        }
      />

      <div className="mx-auto mt-7 flex flex-wrap items-start justify-center gap-5 px-5 max-md:mt-3 max-md:flex-col max-md:gap-3 max-md:px-4">
        <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
          <button
            type="button"
            className="w-full min-h-[58px] cursor-pointer rounded-[14px] border-none bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))] px-8 py-3 font-display text-[1.3rem] tracking-[2px] text-black shadow-[0_0_24px_rgba(46,204,113,0.35)] transition-all duration-250 hover:scale-105 max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-[1.05rem]"
            onClick={() => onNavigate("rankvote", 1)}
          >
            🗳️ VOTAR RANKING
          </button>
          <p className="m-0 flex min-h-9 items-center justify-center text-center text-[0.75rem] font-semibold leading-normal text-lm-text2 max-md:min-h-0 max-md:flex-[1.3] max-md:text-left max-md:text-[0.72rem]">
            Elige a tu looksmaxer favorito para que suba en el ranking
          </p>
        </div>
        <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
          <button
            type="button"
            className="w-full min-h-[58px] cursor-pointer rounded-[14px] border-none bg-[linear-gradient(135deg,#ff6b35,var(--color-lm-gold))] px-8 py-3 font-display text-[1.3rem] tracking-[2px] text-black shadow-[0_0_24px_rgba(255,107,53,0.35)] transition-all duration-250 hover:scale-105 max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4 max-md:py-2.5 max-md:text-[1.05rem]"
            onClick={() => onNavigate("torneo", 2)}
          >
            ⚽ TORNEO EN VIVO
          </button>
          <p className="m-0 flex min-h-9 items-center justify-center text-center text-[0.75rem] font-semibold leading-normal text-lm-text2 max-md:min-h-0 max-md:flex-[1.3] max-md:text-left max-md:text-[0.72rem]">
            ¡El torneo ha comenzado — vota los partidos!
          </p>
        </div>
      </div>

      <AdBanner clientId={adsenseClient} />

      <div className="mx-auto max-w-[700px] px-5 pb-6 max-md:px-4 max-md:pb-4">
        <div className="relative overflow-hidden rounded-2xl border border-lm-border2 bg-[linear-gradient(135deg,rgba(232,184,75,0.06),rgba(232,184,75,0.02))] px-4 py-6 text-center">
          <div className="mb-4 text-[0.65rem] font-extrabold uppercase tracking-[2px] text-lm-text2">
            ⏳ Próxima Actualización del Ranking
          </div>
          <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="gold" />
          <div className="mt-3 text-[0.7rem] font-semibold text-lm-text2">
            El ranking se actualiza automáticamente cuando termina la{" "}
            <span className="text-lm-gold">votación de ranking</span> · Cada 6 horas
          </div>
        </div>
      </div>

      <div
        className="mx-auto mb-6 grid max-w-[1100px] grid-cols-2 gap-3 px-5 max-md:grid-cols-1 max-md:gap-2.5 max-md:px-4"
        id="moversGrid"
      >
        <MoversCard title="📈 Mayores Subidas" variant="up" movers={upMovers} />
        <MoversCard title="📉 Últimos Movimientos" variant="down" movers={downMovers} />
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-12 max-md:px-2.5 max-md:pb-20">
        <SectionTitle className="mb-4">🏆 Ranking Completo</SectionTitle>
        <div className="flex flex-col gap-2" id="rankList">
          {entries.map((entry, i) => (
            <RankRow key={entry.name} entry={entry} index={i} onOpenProfile={onOpenProfile} />
          ))}
        </div>
      </div>

      <AdBanner clientId={adsenseClient} />

      <div className="mx-auto mb-6 flex max-w-[1100px] items-center gap-4 px-5 max-md:px-3">
        <div className="h-px flex-1 bg-lm-border" />
        <div className="whitespace-nowrap text-[0.65rem] font-extrabold uppercase tracking-[2px] text-lm-text2">
          🗳️ Votación Especial · Próximo Candidato
        </div>
        <div className="h-px flex-1 bg-lm-border" />
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-16 max-md:px-3 max-md:pb-8">
        <EntryVoteCard />
      </div>
    </div>
  );
}
