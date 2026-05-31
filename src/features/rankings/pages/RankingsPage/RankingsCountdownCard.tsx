"use client";

import { IconLabel } from "@/components/icons";
import { CountdownDigits } from "@/features/shared/components/ui/CountdownDigits";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { cn } from "@/lib/cn";

export function RankingsCountdownCard({ rankVoteEnd }: { rankVoteEnd: number | null }) {
  const cd = useCountdown(rankVoteEnd);

  return (
    <div className="mx-auto max-w-[700px] px-5 pt-2 pb-6 max-md:px-4 max-md:pt-1 max-md:pb-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-lm-border2 px-4 py-6 text-center",
          "bg-[linear-gradient(135deg,rgba(232,184,75,0.06),rgba(232,184,75,0.02))]",
        )}
      >
        <div className="mb-4 lm-type-label text-lm-text2">
          <IconLabel icon="hourglass" iconSize={14} className="justify-center">
            Próxima Actualización del Ranking
          </IconLabel>
        </div>
        <CountdownDigits h={cd.h} m={cd.m} s={cd.s} variant="gold" />
        <div className="mt-3 text-base font-semibold text-lm-text2">
          El ranking se actualiza automáticamente cuando termina la{" "}
          <span className="text-lm-gold">votación de ranking</span> · Cada 3 horas
        </div>
      </div>
    </div>
  );
}
