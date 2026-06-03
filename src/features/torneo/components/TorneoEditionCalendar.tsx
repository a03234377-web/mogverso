"use client";

import { Icon } from "@/components/icons";
import {
  formatTorneoStartDate,
  getTorneoPhaseSchedule,
  type TorneoScheduleMilestone,
} from "@/lib/torneo-schedule";
import { cn } from "@/lib/cn";

type TorneoEditionCalendarProps = {
  editionStartMs: number;
  now: number;
  className?: string;
};

function MilestoneIcon({ status }: { status: TorneoScheduleMilestone["status"] }) {
  if (status === "past") {
    return (
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          "border border-[rgba(232,184,75,0.35)] bg-[rgba(232,184,75,0.12)] text-lm-gold",
        )}
        aria-hidden
      >
        <Icon name="check" size={16} strokeWidth={3} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center rounded-full",
          "border-2 border-lm-gold bg-[rgba(232,184,75,0.18)]",
          "animate-pulse shadow-[0_0_16px_rgba(232,184,75,0.35)]",
        )}
        aria-hidden
      >
        <Icon name="zap" size={16} className="text-lm-gold" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        "border border-lm-border bg-lm-card text-lm-text2",
      )}
      aria-hidden
    >
      <Icon name="calendar" size={16} />
    </span>
  );
}

export function TorneoEditionCalendar({
  editionStartMs,
  now,
  className,
}: TorneoEditionCalendarProps) {
  const milestones = getTorneoPhaseSchedule(editionStartMs, now);
  const { timeLabel } = formatTorneoStartDate(editionStartMs);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[520px] rounded-2xl border border-lm-border",
        "bg-lm-card/80 px-4 py-4 backdrop-blur-sm",
        className,
      )}
      aria-label="Calendario del torneo"
    >
      <p className="mb-3 text-center lm-type-label text-lm-text2">
        Calendario · cada fase termina a las {timeLabel} (hora España)
      </p>
      <ul className="flex list-none flex-col gap-2 p-0">
        {milestones.map((m) => {
          const endFmt = formatTorneoStartDate(m.endMs);
          return (
            <li
              key={m.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                m.status === "active" &&
                  "border-[rgba(232,184,75,0.45)] bg-[rgba(232,184,75,0.08)]",
                m.status === "past" && "border-lm-border bg-lm-bg2/50 opacity-80",
                m.status === "upcoming" && "border-lm-border bg-transparent",
              )}
            >
              <MilestoneIcon status={m.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-bold text-lm-text">{m.label}</span>
                  <span className="text-sm font-semibold text-lm-gold">
                    {m.weekdayShort} · fin {endFmt.timeLabel}
                  </span>
                </div>
                <p className="text-sm text-lm-text2">
                  {m.status === "past" && "Completada"}
                  {m.status === "active" && "En curso — vota en todos los duelos"}
                  {m.status === "upcoming" && "Próximamente"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
