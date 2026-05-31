import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type HeroSectionProps = {
  eyebrow?: ReactNode;
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
            "mb-3 lm-type-label text-base leading-snug",
            variant === "torneo" ? "text-[#ff6b35]" : "text-lm-gold",
          )}
        >
          {eyebrow}
        </div>
      )}
      <h1
        className={cn(
          "mx-auto w-fit max-w-full max-[360px]:tracking-[0.02em] max-md:tracking-[0.04em]",
          variant === "default" &&
            cn(
              "animate-hero-entrance bg-clip-text font-display tracking-[4px] text-transparent",
              [
                "bg-[linear-gradient(135deg,#fff_0%,var(--color-lm-gold2)_40%,",
                "var(--color-lm-gold)_70%,var(--color-lm-gold3)_100%)]",
              ].join(""),
              "text-[clamp(2.4rem,8vw,9rem)]",
            ),
          variant === "torneo" &&
            cn(
              "bg-clip-text font-display tracking-[4px] text-transparent",
              "bg-[linear-gradient(135deg,#fff_0%,#ff9f5b_40%,#ff6b35_70%,var(--color-lm-gold)_100%)]",
              "text-[clamp(2.4rem,9vw,8rem)]",
            ),
          variant === "rankvote" &&
            cn(
              "bg-clip-text font-sans font-bold tracking-tight text-transparent",
              "bg-[linear-gradient(135deg,var(--color-lm-green2),#3bde8f,var(--color-lm-gold))]",
              "text-[clamp(1.75rem,6vw,3.25rem)]",
            ),
        )}
      >
        {title}
      </h1>
      {subtitle && (
        <div
          className={cn(
            "mt-2 font-sans font-semibold tracking-wide text-lm-text2 uppercase",
            variant === "default" && "text-[clamp(0.85rem,1.8vw,1.25rem)]",
            variant === "torneo" && "text-[clamp(0.72rem,2.5vw,0.8rem)] max-md:px-2",
            variant === "rankvote" && "text-[clamp(0.68rem,2.5vw,0.78rem)] max-md:px-2",
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
    <div
      className={cn(
        "flex items-center gap-1 rounded-full border border-lm-border2 px-3 py-1.5",
        "bg-[rgba(232,184,75,0.08)] text-sm font-bold text-lm-gold",
      )}
    >
      {children}
    </div>
  );
}
