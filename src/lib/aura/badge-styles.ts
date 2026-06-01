import { cn } from "@/lib/cn";

const badgeBase =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-black";

/** Badge de puntuación aura: amarillo (0), verde (>0), rojo (<0). */
export function auraBadgeClassName(aura: number): string {
  if (aura > 0) {
    return cn(
      badgeBase,
      "border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.12)] text-lm-green2",
    );
  }
  if (aura < 0) {
    return cn(
      badgeBase,
      "border-[rgba(255,71,87,0.4)] bg-[rgba(255,71,87,0.12)] text-lm-red2",
    );
  }
  return cn(
    badgeBase,
    "border-[rgba(232,184,75,0.35)] bg-[rgba(232,184,75,0.12)] text-lm-gold",
  );
}

export function auraBadgeIconClassName(aura: number): string {
  if (aura > 0) return "text-lm-green2";
  if (aura < 0) return "text-lm-red2";
  return "text-lm-gold";
}
