import type { Mover } from "@/lib/looksmax/ranking";
import { cn } from "@/lib/cn";

type MoversCardProps = {
  title: string;
  variant: "up" | "down";
  movers: Mover[];
};

export function MoversCard({ title, variant, movers }: MoversCardProps) {
  return (
    <div className="rounded-[14px] border border-lm-border bg-lm-card px-5 py-4">
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 text-[0.7rem] font-extrabold uppercase tracking-[1.5px]",
          variant === "up" ? "text-lm-green2" : "text-lm-red2",
        )}
      >
        {title}
      </div>
      <div id={variant === "up" ? "moversUp" : "moversDown"}>
        {movers.length === 0 ? (
          <div className="py-1.5 text-[0.75rem] text-lm-text2">Sin movimientos recientes</div>
        ) : (
          movers.slice(0, 3).map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between gap-2 border-b border-lm-border py-2 last:border-b-0"
            >
              <div className="flex items-center gap-2 text-[0.9rem] font-bold">
                <span className="text-[0.75rem] font-bold text-lm-text2">#{m.rank}</span> {m.name}
              </div>
              <div
                className={cn(
                  "flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-extrabold",
                  variant === "up"
                    ? "bg-[rgba(46,204,113,0.15)] text-lm-green2"
                    : "bg-[rgba(255,71,87,0.15)] text-lm-red2",
                )}
              >
                {variant === "up" ? "▲" : "▼"} {variant === "up" ? "+" : "-"}
                {m.delta}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
