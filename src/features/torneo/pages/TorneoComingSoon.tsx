"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { ActivePage } from "@/components/ui/ActivePage";
import { SpainTimezoneNote } from "@/components/ui/SpainTimezoneNote";
import { HeroSection } from "@/components/ui/HeroSection";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTorneoStartDate, getUpcomingTorneoStartMs } from "@/lib/torneo-schedule";
import {
  TORNEO_PRESTART_BRACKET,
  TORNEO_PRESTART_FIRST_ROUND,
  TORNEO_PRESTART_FOOTER,
  TORNEO_PRESTART_HEADLINE,
  TORNEO_PRESTART_LABEL,
} from "@/features/torneo/components/torneo-prestart-copy";
import {
  TORNEO_HERO_EYEBROW,
  TORNEO_HERO_SUBTITLE,
  TORNEO_HERO_TITLE,
} from "@/features/torneo/components/torneo-hero-content";
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
    <ActivePage id="page-torneo" active entrance={false}>
      <HeroSection
        variant="torneo"
        eyebrow={TORNEO_HERO_EYEBROW}
        title={TORNEO_HERO_TITLE}
        subtitle={TORNEO_HERO_SUBTITLE}
      />

      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">{TORNEO_PRESTART_LABEL}</PhaseLabel>
          <div className="my-1 font-display text-[clamp(0.9rem,2.5vw,1.3rem)] tracking-[3px] text-lm-text2">
            Torneo de LooksMaxing
          </div>
          <PhaseTitle color="orange" className="text-[clamp(2rem,6vw,4.5rem)]">
            {TORNEO_PRESTART_HEADLINE}
          </PhaseTitle>
          <div className="mb-2 text-center text-base font-bold text-lm-text2">
            {TORNEO_PRESTART_FIRST_ROUND}
          </div>
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
          <div className="mb-3.5 text-center text-base leading-snug font-bold text-lm-text2">
            <Icon
              name="calendar"
              size={14}
              className="mr-1 inline shrink-0 align-middle"
            />
            {dayName} {dateLabel}
          </div>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="orange" />
          <PhaseSub className="mt-3 mb-0">
            <Icon name="zap" size={14} className="mr-1 inline shrink-0 align-middle" />
            {TORNEO_PRESTART_BRACKET}
            <br />
            {TORNEO_PRESTART_FOOTER} {timeLabel} · {dayName.toLowerCase()} {dateLabel}
          </PhaseSub>
          <SpainTimezoneNote className="mt-4 text-center" />
        </PhaseCard>
      </PhaseDisplay>
    </ActivePage>
  );
}
