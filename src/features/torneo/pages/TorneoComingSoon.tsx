"use client";

import { useEffect, useState } from "react";
import { Icon, IconLabel } from "@/components/icons";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { HeroSection } from "@/features/shared/components/ui/HeroSection";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { formatTorneoStartDate, getUpcomingTorneoStartMs } from "@/lib/torneo-schedule";
import { cn } from "@/lib/cn";

export function TorneoComingSoon() {
  const [now, setNow] = useState(() => Date.now());
  const startMs = getUpcomingTorneoStartMs(now);
  const cd = useCountdown(startMs);
  const { dayName, dateLabel, timeLabel } = formatTorneoStartDate(startMs);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ActivePage id="page-torneo" active>
      <HeroSection
        variant="torneo"
        eyebrow={
          <IconLabel icon="goal" iconSize={14} iconClassName="text-[#ff6b35]">
            Torneo Oficial · 16 Participantes
          </IconLabel>
        }
        title={
          <>
            Torneo
            <br />
            Looksmaxing
          </>
        }
        subtitle="Eliminación directa · El mejor looksmaxer de España"
      />

      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">PRÓXIMO TORNEO</PhaseLabel>
          <div className="my-1 font-display text-[clamp(0.9rem,2.5vw,1.3rem)] tracking-[3px] text-lm-text2">
            Torneo de LooksMaxing
          </div>
          <PhaseTitle color="orange" className="text-[clamp(2rem,6vw,4.5rem)]">
            Viernes · 23:00
          </PhaseTitle>
          <div
            className={cn(
              "mx-auto my-1 mb-2.5 w-fit max-w-full font-display text-transparent",
              "bg-[linear-gradient(135deg,var(--color-lm-orange),var(--color-lm-gold2))] bg-clip-text",
              "text-[clamp(1.4rem,6vw,6rem)] tracking-[6px]",
              "max-[360px]:tracking-[1px] max-md:tracking-[2px]",
            )}
          >
            EMPIEZA A LAS {timeLabel}
          </div>
          <div className="mb-3.5 flex items-center justify-center gap-1.5 text-sm font-bold text-lm-text2">
            <Icon name="calendar" size={14} />
            {dayName} {dateLabel}
          </div>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="orange" />
          <PhaseSub className="mt-3 mb-0">
            <IconLabel icon="zap" iconSize={14} className="justify-center">
              El siguiente torneo será el {dayName.toLowerCase()} a las {timeLabel}
            </IconLabel>
          </PhaseSub>
        </PhaseCard>
      </PhaseDisplay>
    </ActivePage>
  );
}
