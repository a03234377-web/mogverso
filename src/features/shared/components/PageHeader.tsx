import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

type PageHeaderProps = {
  icon?: IconName;
  title: string;
  desc: string;
  /** `readable`: Syne para títulos de lectura. `display`: Bebas (cartel). */
  variant?: "readable" | "display";
};

export function PageHeader({
  icon,
  title,
  desc,
  variant = "readable",
}: PageHeaderProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-8 pb-4 max-md:px-4 max-md:pt-5 max-md:pb-2">
      <div className="flex items-baseline gap-2.5">
        {icon && (
          <Icon
            name={icon}
            size={28}
            className="relative top-[0.12em] shrink-0 text-lm-gold max-md:h-6 max-md:w-6"
          />
        )}
        <h1
          className={cn(
            "w-fit max-w-full leading-tight",
            variant === "display"
              ? cn(
                  "bg-clip-text font-display tracking-[3px] text-transparent",
                  [
                    "bg-[linear-gradient(135deg,var(--color-lm-text)_0%,",
                    "var(--color-lm-gold2)_60%,var(--color-lm-gold)_100%)]",
                  ].join(""),
                  "text-[clamp(1.6rem,4vw,3.5rem)] max-md:text-[clamp(1.5rem,6vw,2.2rem)]",
                )
              : "font-sans text-[clamp(1.5rem,2.5vw,2rem)] font-bold tracking-tight text-lm-text lg:text-[2rem]",
          )}
        >
          {title}
        </h1>
      </div>
      <p
        className={cn(
          "mt-2 max-w-[65ch] text-base leading-relaxed text-lm-text2",
          variant === "readable" && "font-serif font-normal",
          variant === "display" && "font-sans leading-snug font-semibold",
        )}
      >
        {desc}
      </p>
    </div>
  );
}
