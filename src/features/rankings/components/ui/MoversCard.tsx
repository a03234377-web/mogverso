import { Icon } from "@/components/icons";
import type { Mover } from "@/features/rankings/lib/ranking";
import { cn } from "@/lib/cn";
import type { IconName } from "@/types/icons";

type MoversCardProps = {
  title: string;
  titleIcon: IconName;
  variant: "up" | "down";
  movers: Mover[];
};

export function MoversCard({ title, titleIcon, variant, movers }: MoversCardProps) {
  return (
    <div className="rounded-[14px] border border-lm-border bg-lm-card px-5 py-4">
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 text-base font-extrabold tracking-[1.5px] uppercase",
          variant === "up" ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        <Icon name={titleIcon} size={14} />
        {title}
      </div>
      <div id={variant === "up" ? "moversUp" : "moversDown"}>
        {movers.length === 0 ? (
          <div className="py-1.5 text-base text-lm-text2">
            Sin movimientos recientes
          </div>
        ) : (
          movers.map((m) => (
            <div
              key={`${m.ts}-${m.name}`}
              className="flex items-center justify-between gap-2 border-b border-lm-border py-2 last:border-b-0"
            >
              <div className="flex items-center gap-2 text-base font-bold">
                <span className="text-base font-bold text-lm-text2">#{m.rank}</span>{" "}
                {m.name}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-base font-extrabold whitespace-nowrap",
                  variant === "up"
                    ? "bg-[rgba(46,204,113,0.15)] text-lm-green2"
                    : "bg-[rgba(255,71,87,0.15)] text-lm-red2",
                )}
              >
                <Icon
                  name={variant === "up" ? "trending-up" : "trending-down"}
                  size={12}
                  className={variant === "up" ? "text-lm-green2" : "text-lm-red2"}
                />
                {variant === "up" ? "+" : "-"}
                {m.delta}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
