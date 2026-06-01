import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Icon } from "@/components/icons";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import type { AuraLeader } from "@/lib/aura/leaderboard";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

type AuraLeadersCardProps = {
  title: string;
  titleIcon: IconName;
  variant: "up" | "down";
  leaders: AuraLeader[];
};

export function AuraLeadersCard({
  title,
  titleIcon,
  variant,
  leaders,
}: AuraLeadersCardProps) {
  return (
    <div className="rounded-[14px] border border-lm-border bg-lm-card px-5 py-4">
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 lm-type-label text-base",
          variant === "up" ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        <Icon name={titleIcon} size={14} />
        {title}
      </div>
      <div>
        {leaders.length === 0 ? (
          <div className="py-1.5 text-base text-lm-text2">Sin datos de aura aún</div>
        ) : (
          leaders.map((leader, i) => (
            <ScrollReveal
              key={leader.name}
              delay={i * 0.03}
              y={32}
              className="flex items-center justify-between gap-2 border-b border-lm-border py-2 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2 text-base font-bold">
                <span className="shrink-0 text-base font-bold text-lm-text2">
                  #{leader.rank}
                </span>
                <RankerProfileLink
                  name={leader.name}
                  from="aura"
                  className="truncate text-lm-text"
                />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-bold whitespace-nowrap",
                  variant === "up"
                    ? "bg-[rgba(46,204,113,0.15)] text-lm-green2"
                    : "bg-[rgba(255,71,87,0.15)] text-lm-red2",
                )}
              >
                <Icon name="sparkles" size={12} />
                {leader.aura.toLocaleString("es-ES")}
              </div>
            </ScrollReveal>
          ))
        )}
      </div>
    </div>
  );
}
