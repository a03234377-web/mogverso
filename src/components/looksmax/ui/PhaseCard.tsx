import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PhaseColor = "orange" | "green" | "purple" | "gold";
export type PhaseCardVariant = "waiting" | "voting" | "break" | "semifinals";

const cardVariants: Record<PhaseCardVariant, string> = {
  waiting:
    "border-2 border-[rgba(255,107,53,0.5)] bg-[linear-gradient(135deg,rgba(232,184,75,0.1),rgba(255,107,53,0.06))]",
  voting:
    "border-2 border-[rgba(46,204,113,0.5)] bg-[linear-gradient(135deg,rgba(46,204,113,0.1),rgba(59,130,246,0.06))]",
  break:
    "border-2 border-[rgba(168,85,247,0.4)] bg-[linear-gradient(135deg,rgba(168,85,247,0.1),rgba(232,184,75,0.05))]",
  semifinals:
    "border-2 border-[rgba(232,184,75,0.5)] bg-[linear-gradient(135deg,rgba(232,184,75,0.12),rgba(255,107,53,0.05))]",
};

const labelColors: Record<PhaseColor, string> = {
  orange: "text-[#ff6b35]",
  green: "text-lm-green2",
  purple: "text-lm-purple",
  gold: "text-lm-gold",
};

const dotColors: Record<PhaseColor, string> = {
  orange: "bg-[#ff6b35]",
  green: "bg-lm-green2",
  purple: "bg-lm-purple",
  gold: "bg-lm-gold",
};

const titleGradients: Record<PhaseColor, string> = {
  orange:
    "bg-[linear-gradient(135deg,#fff,#ff9f5b,#ff6b35)] bg-clip-text text-transparent",
  green: "bg-[linear-gradient(135deg,#fff,var(--color-lm-green2))] bg-clip-text text-transparent",
  purple:
    "bg-[linear-gradient(135deg,#fff,#c084fc,var(--color-lm-purple))] bg-clip-text text-transparent",
  gold: "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text text-transparent",
};

const timerNumStyles: Record<PhaseColor, string> = {
  orange:
    "text-[#ff6b35] border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.12)]",
  green:
    "text-lm-green2 border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.12)]",
  purple:
    "text-lm-purple border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.12)]",
  gold: "text-lm-gold2 border border-[rgba(232,184,75,0.3)] bg-[rgba(232,184,75,0.12)]",
};

const timerSepColors: Record<PhaseColor, string> = {
  orange: "text-[#ff6b35]",
  green: "text-lm-green2",
  purple: "text-lm-purple",
  gold: "text-lm-gold",
};

export function PhaseDisplay({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mb-8 max-w-[860px] px-5 max-md:px-3">{children}</div>
  );
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
    <div
      id={id}
      className={cn(
        "relative overflow-hidden rounded-[20px] px-6 py-8 text-center max-md:px-4",
        cardVariants[variant],
        className,
      )}
    >
      {children}
    </div>
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
        "mb-2.5 flex items-center justify-center gap-2 text-[0.65rem] font-black uppercase tracking-[3px]",
        labelColors[color],
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full animate-pulse-soft", dotColors[color])}
        style={pulse ? { animation: "pulse 0.8s infinite" } : undefined}
      />
      {children}
      <span className={cn("h-2 w-2 rounded-full animate-pulse-soft", dotColors[color])} />
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
        "font-display mb-1 text-[clamp(1.8rem,5vw,4rem)] leading-none tracking-[3px]",
        titleGradients[color],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PhaseSub({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-5 text-[0.78rem] font-semibold text-lm-text2", className)}>
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
          "mb-3 font-display text-[2.5rem] opacity-50 animate-blink max-md:text-[clamp(1.4rem,5vw,2.8rem)]",
          timerSepColors[color],
        )}
      >
        :
      </div>
      <TimerUnit value={m} label="Min" color={color} />
      <div
        className={cn(
          "mb-3 font-display text-[2.5rem] opacity-50 animate-blink max-md:text-[clamp(1.4rem,5vw,2.8rem)]",
          timerSepColors[color],
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
          "font-display min-w-[65px] rounded-xl px-2 py-0.5 text-center text-[clamp(2rem,6vw,4.5rem)] leading-none max-md:min-w-12 max-md:text-[clamp(1.4rem,5vw,2.8rem)]",
          timerNumStyles[color],
        )}
      >
        {value}
      </div>
      <div className="text-[0.55rem] font-extrabold uppercase tracking-[1.5px] text-lm-text2">
        {label}
      </div>
    </div>
  );
}
