import { Icon } from "@/components/icons";
import { formatAuraScore } from "@/lib/aura/coerce-score";
import { auraBadgeClassName, auraBadgeIconClassName } from "@/lib/aura/badge-styles";
import { cn } from "@/lib/cn";

const TOTAL_TITLE = "Total de aura acumulada este mes (todos los votos sumados)";

type AuraScoreBadgeProps = {
  /** Total acumulado en Firebase (no el incremento del último clic). */
  total: number;
  /** Incremento del último voto (+230 / −100), solo feedback temporal. */
  voteDelta?: number | null;
  className?: string;
  iconSize?: number;
};

/**
 * Badge de puntuación aura: siempre el total del mes.
 * Los botones +230 / −100 modifican ese total en el servidor (suma/resta).
 */
export function AuraScoreBadge({
  total,
  voteDelta = null,
  className,
  iconSize = 12,
}: AuraScoreBadgeProps) {
  const showDelta = voteDelta !== null && voteDelta !== 0;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span
        className={cn(
          auraBadgeClassName(total),
          "shrink-0 whitespace-nowrap tabular-nums",
        )}
        title={TOTAL_TITLE}
      >
        <Icon
          name="sparkles"
          size={iconSize}
          className={auraBadgeIconClassName(total)}
        />
        {formatAuraScore(total)} aura
      </span>
      {showDelta ? (
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-xs font-black tabular-nums",
            voteDelta! > 0
              ? "border-[rgba(46,204,113,0.45)] bg-[rgba(46,204,113,0.15)] text-lm-green2"
              : "border-[rgba(255,71,87,0.45)] bg-[rgba(255,71,87,0.15)] text-lm-red2",
          )}
          title="Cambio aplicado con tu último voto"
        >
          {voteDelta! > 0 ? "+" : ""}
          {formatAuraScore(voteDelta!)}
        </span>
      ) : null}
    </span>
  );
}
