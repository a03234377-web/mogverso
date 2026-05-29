import { Icon } from "@/components/icons";
import type { IconName } from "@/types/icons";

export function PageHeader({
  icon,
  title,
  desc,
}: {
  icon?: IconName;
  title: string;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pt-8 pb-4 max-md:px-4 max-md:pt-5 max-md:pb-2">
      <div className="flex items-baseline gap-2.5">
        {icon && (
          <Icon
            name={icon}
            size={28}
            className="relative top-[0.12em] shrink-0 text-lm-gold"
          />
        )}
        <h1 className="w-fit bg-[linear-gradient(135deg,var(--color-lm-text)_0%,var(--color-lm-gold2)_60%,var(--color-lm-gold)_100%)] bg-clip-text font-display text-[clamp(1.6rem,4vw,3.5rem)] tracking-[3px] text-transparent max-md:text-[clamp(1.5rem,6vw,2.2rem)]">
          {title}
        </h1>
      </div>
      <div className="mt-1 text-base leading-snug font-semibold text-lm-text2 max-md:text-base">
        {desc}
      </div>
    </div>
  );
}
