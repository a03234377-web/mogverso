"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { AdBanner } from "@/features/rankings/components/AdBanner";
import { IconLabel } from "@/components/icons";
import { EntryVoteCard } from "@/features/rankings/components/EntryVoteCard";
import { RankingsCountdownCard } from "./RankingsCountdownCard";
import { RankingsQuickActions } from "./RankingsQuickActions";
import { HeroBadge, HeroSection } from "@/features/shared/components/ui/HeroSection";
import { MoversCard } from "@/features/rankings/components/ui/MoversCard";
import { RankRow } from "@/features/rankings/components/ui/RankRow";
import { SectionTitle } from "@/features/shared/components/ui/SectionTitle";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import type { Mover, RankedEntry } from "@/features/rankings/lib/ranking";
import { cn } from "@/lib/cn";

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
  const { openProfile } = useLooksMaxNavigate();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [entries.length]);

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

      <RankingsQuickActions />
      <RankingsCountdownCard rankVoteEnd={rankVoteEnd} />

      <div
        className={cn(
          "mx-auto mb-6 grid max-w-[1100px] grid-cols-2 gap-3 px-5",
          "max-md:grid-cols-1 max-md:gap-2.5 max-md:px-4",
        )}
        id="moversGrid"
      >
        <ScrollReveal y={36}>
          <MoversCard
            title="Mayores Subidas"
            titleIcon="trending-up"
            variant="up"
            movers={upMovers}
          />
        </ScrollReveal>
        <ScrollReveal y={36} delay={0.04}>
          <MoversCard
            title="Últimos Movimientos"
            titleIcon="trending-down"
            variant="down"
            movers={downMovers}
          />
        </ScrollReveal>
      </div>

      <div className="mx-auto max-w-[1100px] px-5 pb-12 max-md:px-2.5 max-md:pb-20">
        <ScrollReveal
          y={28}
          className="mb-4"
          enterSpan={0.22}
          holdSpan={0.56}
          exitSpan={0.22}
        >
          <SectionTitle>
            <IconLabel icon="trophy" iconSize={20}>
              Ranking Completo
            </IconLabel>
          </SectionTitle>
        </ScrollReveal>
        <div className="flex flex-col gap-2" id="rankList">
          {entries.map((entry, i) => (
            <ScrollReveal
              key={entry.name}
              className="w-full"
              y={36}
              enterSpan={0.22}
              holdSpan={0.56}
              exitSpan={0.22}
              start="top bottom+=6%"
              end="bottom top+=6%"
            >
              <RankRow
                entry={entry}
                index={i}
                onOpenProfile={(name, rank) => openProfile(name, rank, "rankings")}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AdBanner clientId={adsenseClient} />

      <ScrollReveal
        y={56}
        scrollRange="block"
        className="mx-auto max-w-[1100px] px-5 pb-16 max-md:px-3 max-md:pb-4"
      >
        <div
          className={cn("mb-6 flex items-center gap-4 max-md:flex-col max-md:gap-2")}
        >
          <div className="h-px flex-1 bg-lm-border max-md:hidden" />
          <div className="text-center lm-type-label leading-snug text-lm-text2 md:whitespace-nowrap">
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
        <EntryVoteCard />
      </ScrollReveal>
    </div>
  );
}
