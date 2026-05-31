export type PhaseColor = "orange" | "green" | "purple" | "gold";
export type PhaseCardVariant = "waiting" | "voting" | "break" | "semifinals";

export const cardVariants: Record<PhaseCardVariant, string> = {
  waiting:
    "border-2 border-[rgba(255,107,53,0.5)] bg-[linear-gradient(135deg,rgba(232,184,75,0.1),rgba(255,107,53,0.06))]",
  voting:
    "border-2 border-[rgba(46,204,113,0.5)] bg-[linear-gradient(135deg,rgba(46,204,113,0.1),rgba(59,130,246,0.06))]",
  break:
    "border-2 border-[rgba(168,85,247,0.4)] bg-[linear-gradient(135deg,rgba(168,85,247,0.1),rgba(232,184,75,0.05))]",
  semifinals:
    "border-2 border-[rgba(232,184,75,0.5)] bg-[linear-gradient(135deg,rgba(232,184,75,0.12),rgba(255,107,53,0.05))]",
};

export const labelColors: Record<PhaseColor, string> = {
  orange: "text-[#ff6b35]",
  green: "text-lm-green2",
  purple: "text-lm-purple",
  gold: "text-lm-gold",
};

export const dotColors: Record<PhaseColor, string> = {
  orange: "bg-[#ff6b35]",
  green: "bg-lm-green2",
  purple: "bg-lm-purple",
  gold: "bg-lm-gold",
};

export const titleGradients: Record<PhaseColor, string> = {
  orange:
    "bg-[linear-gradient(135deg,#fff,#ff9f5b,#ff6b35)] bg-clip-text text-transparent",
  green:
    "bg-[linear-gradient(135deg,#fff,var(--color-lm-green2))] bg-clip-text text-transparent",
  purple:
    "bg-[linear-gradient(135deg,#fff,#c084fc,var(--color-lm-purple))] bg-clip-text text-transparent",
  gold: "bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text text-transparent",
};

export const timerNumStyles: Record<PhaseColor, string> = {
  orange:
    "text-[#ff6b35] border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.12)]",
  green:
    "text-lm-green2 border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.12)]",
  purple:
    "text-lm-purple border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.12)]",
  gold: "text-lm-gold2 border border-[rgba(232,184,75,0.3)] bg-[rgba(232,184,75,0.12)]",
};

export const timerSepColors: Record<PhaseColor, string> = {
  orange: "text-[#ff6b35]",
  green: "text-lm-green2",
  purple: "text-lm-purple",
  gold: "text-lm-gold",
};
