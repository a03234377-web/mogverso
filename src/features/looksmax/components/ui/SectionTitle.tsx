import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
  center?: boolean;
  id?: string;
};

export function SectionTitle({ children, className, center, id }: SectionTitleProps) {
  return (
    <div
      id={id}
      className={cn(
        "font-display text-[clamp(1.4rem,3vw,2rem)] tracking-[3px] text-lm-text",
        center && "flex items-baseline justify-center gap-2.5 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
