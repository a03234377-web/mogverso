import type { ReactNode } from "react";
import { WormBorder, type WormBorderTheme } from "@/components/ui/WormBorder";
import { cn } from "@/lib/cn";

export type PhaseColor = "orange" | "green" | "purple" | "gold";
export type PhaseCardVariant = "waiting" | "voting" | "break" | "semifinals";

const TORNEO_WORM_THEMES: Record<PhaseCardVariant, WormBorderTheme> = {
  waiting: "torneo-waiting",
  voting: "torneo-voting",
  break: "torneo-break",
  semifinals: "torneo-semifinals",
};

export function PhaseDisplay({ children }: { children: ReactNode }) {
  return <div className="mx-auto mb-8 max-w-[860px] px-5 max-md:px-3">{children}</div>;
}

export function PhaseCard({
  variant,
  children,
  className,
  id = "torneoPhaseCard",
}: {
  variant: PhaseCardVariant;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <WormBorder
      animated
      id={id}
      theme={TORNEO_WORM_THEMES[variant]}
      className={className}
      innerClassName={cn(
        "relative overflow-hidden px-6 py-8 text-center max-md:px-4",
        `phase-card--${variant}`,
      )}
    >
      {children}
    </WormBorder>
  );
}

export function PhaseLabel({
  color,
  children,
  pulse,
}: {
  color: PhaseColor;
  children: ReactNode;
  pulse?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 lm-type-label max-md:text-sm",
        `phase-color--${color}`,
      )}
    >
      <span
        className={cn("h-2 w-2 animate-pulse-soft rounded-full", `phase-dot--${color}`)}
        style={pulse ? { animation: "pulse 0.8s infinite" } : undefined}
      />
      {children}
      <span
        className={cn("h-2 w-2 animate-pulse-soft rounded-full", `phase-dot--${color}`)}
      />
    </div>
  );
}

export function PhaseTitle({
  color,
  children,
  className,
}: {
  color: PhaseColor;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-1 font-display text-[clamp(1.8rem,5vw,4rem)] tracking-[3px]",
        `phase-title--${color}`,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PhaseSub({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 text-base font-semibold text-lm-text2", className)}>
      {children}
    </div>
  );
}

export function PhaseTimer({
  h,
  m,
  s,
  color,
}: {
  h: string;
  m: string;
  s: string;
  color: PhaseColor;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <TimerUnit value={h} label="Horas" color={color} />
      <div
        className={cn(
          "mb-3 animate-blink font-sans text-2xl font-bold opacity-50 max-md:text-xl",
          `phase-timer-sep--${color}`,
        )}
      >
        :
      </div>
      <TimerUnit value={m} label="Min" color={color} />
      <div
        className={cn(
          "mb-3 animate-blink font-sans text-2xl font-bold opacity-50 max-md:text-xl",
          `phase-timer-sep--${color}`,
        )}
      >
        :
      </div>
      <TimerUnit value={s} label="Seg" color={color} />
    </div>
  );
}

function TimerUnit({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: PhaseColor;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "min-w-[65px] rounded-xl px-2 py-0.5 text-center lm-type-score",
          "text-[clamp(1.75rem,5vw,3.25rem)] max-md:min-w-12 max-md:text-[clamp(1.35rem,5vw,2.25rem)]",
          `phase-timer-num--${color}`,
        )}
      >
        {value}
      </div>
      <div className="lm-type-label text-lm-text2">{label}</div>
    </div>
  );
}
