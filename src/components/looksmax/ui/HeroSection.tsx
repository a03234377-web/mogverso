import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeroSectionProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  badges?: ReactNode;
  variant?: "default" | "torneo" | "rankvote";
  className?: string;
};

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  badges,
  variant = "default",
  className,
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "text-center",
        variant === "default" && "px-5 py-12 pt-12 max-md:px-4 max-md:py-5 max-md:pt-5",
        variant === "torneo" && "px-5 py-10 pt-10 max-md:px-2 max-md:py-5 max-md:pt-5",
        variant === "rankvote" && "px-5 py-8 pt-8 max-md:px-2 max-md:py-5 max-md:pt-5",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "mb-3 text-[0.7rem] font-extrabold uppercase tracking-[3px]",
            variant === "torneo" ? "text-[#ff6b35]" : "text-lm-gold",
          )}
        >
          {eyebrow}
        </div>
      )}
      <div
        className={cn(
          "font-display leading-[0.9] tracking-[4px]",
          variant === "default" &&
            "animate-hero-entrance bg-[linear-gradient(135deg,#fff_0%,var(--color-lm-gold2)_40%,var(--color-lm-gold)_70%,var(--color-lm-gold3)_100%)] bg-clip-text text-[clamp(3rem,8vw,9rem)] text-transparent",
          variant === "torneo" &&
            "bg-[linear-gradient(135deg,#fff_0%,#ff9f5b_40%,#ff6b35_70%,var(--color-lm-gold)_100%)] bg-clip-text text-[clamp(3rem,9vw,8rem)] text-transparent",
          variant === "rankvote" &&
            "bg-[linear-gradient(135deg,var(--color-lm-green2),#3bde8f,var(--color-lm-gold))] bg-clip-text text-[clamp(2.5rem,7vw,6rem)] text-transparent",
        )}
      >
        {title}
      </div>
      {subtitle && (
        <div
          className={cn(
            "mt-2 font-semibold uppercase tracking-[2px] text-lm-text2",
            variant === "default" && "text-[clamp(0.85rem,1.8vw,1.25rem)]",
            variant === "torneo" && "text-[0.8rem]",
            variant === "rankvote" && "text-[0.78rem]",
          )}
        >
          {subtitle}
        </div>
      )}
      {badges && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">{badges}</div>
      )}
    </div>
  );
}

export function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-lm-border2 bg-[rgba(232,184,75,0.08)] px-3 py-1.5 text-[0.68rem] font-bold text-lm-gold">
      {children}
    </div>
  );
}
