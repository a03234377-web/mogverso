import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
  center?: boolean;
  id?: string;
  /** `readable`: Syne. `display`: Bebas (solo héroes / torneo escénico). */
  variant?: "readable" | "display";
};

export function SectionTitle({
  children,
  className,
  center,
  id,
  variant = "readable",
}: SectionTitleProps) {
  return (
    <div
      id={id}
      className={cn(
        variant === "readable" && "lm-type-section text-lm-text",
        variant === "display" &&
          "font-display text-[clamp(1.4rem,3vw,2rem)] tracking-[2px] text-lm-text max-md:tracking-[1px]",
        center && "flex items-baseline justify-center gap-2.5 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
