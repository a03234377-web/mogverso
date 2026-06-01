import { Icon } from "@/components/icons";
import { RankerProfileLink } from "@/features/rankings/components/ui/RankerProfileLink";
import { AuraScoreBadge } from "@/features/aura/components/AuraScoreBadge";
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
          leaders.map((leader) => (
            <div
              key={leader.name}
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
              <AuraScoreBadge total={leader.aura} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
