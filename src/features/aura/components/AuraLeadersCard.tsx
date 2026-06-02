"use client";

import { useRef } from "react";
import { Icon } from "@/components/icons";
import { AuraScoreBadge } from "@/features/aura/components/AuraScoreBadge";
import { useAuraLeaderListMotion } from "@/features/aura/hooks/useAuraLeaderListMotion";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import type { AuraLeader } from "@/lib/aura/leaderboard";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

type AuraLeadersCardProps = {
  title: string;
  titleIcon: IconName;
  variant: "up" | "down";
  leaders: AuraLeader[];
  ready?: boolean;
};

export function AuraLeadersCard({
  title,
  titleIcon,
  variant,
  leaders,
  ready = true,
}: AuraLeadersCardProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { displayLeaders, moveHints, motionState } = useAuraLeaderListMotion(
    listRef,
    leaders,
    variant,
    ready,
  );

  const showEmpty = ready && displayLeaders.length === 0;

  return (
    <div className="rounded-[14px] border border-lm-border bg-lm-card px-5 py-4">
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 lm-type-label text-base",
          variant === "up" ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        <Icon name={titleIcon} size={14} />
        {title}
      </div>
      <div ref={listRef}>
        {showEmpty ? (
          <div className="py-1.5 text-base text-lm-text2">Sin datos de aura aún</div>
        ) : (
          displayLeaders.map((leader) => {
            const moveHint = moveHints[leader.name];
            const motion = motionState[leader.name];

            return (
              <div
                key={leader.name}
                data-aura-leader-flip-id={leader.name}
                data-flip-id={leader.name}
                className={cn(
                  "relative flex items-center justify-between gap-2 border-b border-lm-border py-2 last:border-b-0",
                  "transition-[border-color,box-shadow] duration-300",
                  moveHint === "up" &&
                    "border-lm-green2/45 shadow-[0_0_12px_rgba(46,204,113,0.12)]",
                  moveHint === "down" &&
                    "border-lm-red2/45 shadow-[0_0_12px_rgba(255,71,87,0.1)]",
                  motion === "enter" &&
                    (variant === "up"
                      ? "bg-[rgba(46,204,113,0.06)]"
                      : "bg-[rgba(255,71,87,0.06)]"),
                )}
              >
                {moveHint || motion === "enter" || motion === "exit" ? (
                  <span
                    className={cn(
                      "pointer-events-none absolute top-1.5 right-1 z-[1] flex items-center gap-0.5",
                      "animate-fade-up rounded px-1.5 py-0.5 text-[10px] font-bold",
                      motion === "exit" && "bg-lm-bg3 text-lm-text2",
                      motion === "enter" &&
                        (variant === "up"
                          ? "bg-[rgba(46,204,113,0.2)] text-lm-green2"
                          : "bg-[rgba(255,71,87,0.2)] text-lm-red2"),
                      moveHint === "up" && "bg-[rgba(46,204,113,0.18)] text-lm-green2",
                      moveHint === "down" && "bg-[rgba(255,71,87,0.18)] text-lm-red2",
                    )}
                    aria-live="polite"
                  >
                    {motion === "exit" ? (
                      "Sale"
                    ) : motion === "enter" ? (
                      <>
                        <Icon name="sparkles" size={10} className="shrink-0" />
                        Entra
                      </>
                    ) : moveHint === "up" ? (
                      <>
                        <Icon name="trending-up" size={10} className="shrink-0" />
                        Sube
                      </>
                    ) : (
                      <>
                        <Icon name="trending-down" size={10} className="shrink-0" />
                        Baja
                      </>
                    )}
                  </span>
                ) : null}
                <div className="flex min-w-0 items-center gap-2 text-base font-bold">
                  <span className="shrink-0 text-base font-bold text-lm-text2">
                    #{leader.rank}
                  </span>
                  <RankerProfileLink
                    name={leader.name}
                    from="aura"
                    className="truncate text-lm-text"
                  />
                </div>
                <AuraScoreBadge total={leader.aura} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
