import type { CreatorPhoto } from "@/assets/creators";
import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { CreatorIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function CompareSide({
  label,
  labelClass,
  img,
  score,
  scoreClass,
}: {
  label: string;
  labelClass: "before" | "after";
  img: CreatorPhoto;
  score: string;
  scoreClass: "bad" | "good";
}) {
  return (
    <div className="flex max-w-[280px] min-w-0 flex-1 flex-col items-center gap-1.5 max-md:w-full max-md:max-w-[220px]">
      <div
        className={cn(
          "rounded-full px-2.5 py-0.5 lm-type-label",
          labelClass === "before"
            ? "border border-[rgba(255,71,87,0.3)] bg-[rgba(255,71,87,0.15)] text-lm-red2"
            : "border border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.15)] text-lm-green2",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden rounded-xl border-2 border-white/8 bg-lm-bg3",
          "max-md:rounded-[10px]",
        )}
      >
        <CreatorImage
          src={img}
          alt={label}
          className="object-cover object-top"
          sizes="(max-width: 768px) 220px, 280px"
          fallback={<CreatorIcon name="" size={40} className="opacity-40" />}
        />
      </div>
      <div
        className={cn(
          "lm-type-score text-base",
          scoreClass === "bad" ? "text-lm-red2" : "text-lm-green2",
        )}
      >
        {score}
      </div>
    </div>
  );
}
