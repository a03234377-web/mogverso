import { Icon } from "@/components/icons";
import { AURA_VOTES_PER_WEEK } from "@/lib/aura/constants";
import { cn } from "@/lib/cn";

type AuraQuotaNoticeProps = {
  votesRemaining: number;
  votesUsed: number;
  votedNames: string[];
};

export function AuraQuotaNotice({
  votesRemaining,
  votesUsed,
  votedNames,
}: AuraQuotaNoticeProps) {
  const exhausted = votesRemaining <= 0;

  return (
    <output
      className={cn(
        "mx-auto mb-5 block max-w-[1100px] rounded-xl border px-4 py-3.5",
        "max-md:mx-4",
        exhausted
          ? "border-lm-red2/40 bg-[rgba(255,71,87,0.08)]"
          : "border-lm-gold/35 bg-[rgba(232,184,75,0.08)]",
      )}
    >
      <div
        className={cn(
          "mb-1 flex items-center gap-1.5 text-sm font-bold",
          exhausted ? "text-lm-red2" : "text-lm-gold",
        )}
      >
        <Icon name={exhausted ? "circle-alert" : "info"} size={16} />
        {exhausted ? "Sin votos esta semana" : "Tus votos de aura"}
      </div>
      {exhausted ? (
        <p className="text-sm leading-relaxed text-lm-text2">
          Ya usaste tus {AURA_VOTES_PER_WEEK} votos esta semana (1 por candidato). El
          próximo lunes recuperas{" "}
          <strong className="font-sans font-bold text-lm-text">
            {AURA_VOTES_PER_WEEK} votos nuevos
          </strong>
          , aunque no hayas gastado todos los de ahora.
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-lm-text2">
          Cada lunes tienes{" "}
          <strong className="font-sans font-bold text-lm-text">
            {AURA_VOTES_PER_WEEK} votos
          </strong>{" "}
          (los no usados no se guardan). Te quedan{" "}
          <strong className="font-sans font-bold text-lm-text">
            {votesRemaining} {votesRemaining === 1 ? "voto" : "votos"}
          </strong>{" "}
          para{" "}
          <strong className="font-sans font-bold text-lm-text">
            {votesRemaining}{" "}
            {votesRemaining === 1 ? "candidato distinto" : "candidatos distintos"}
          </strong>
          . Máximo 1 voto por persona (+230 o −100).{" "}
          {votesUsed > 0 ? (
            <>
              Ya votaste a{" "}
              <strong className="font-sans font-bold text-lm-text">{votesUsed}</strong>{" "}
              {votesUsed === 1 ? "candidato" : "candidatos"}.
            </>
          ) : (
            <>Aún no has votado a nadie esta semana.</>
          )}
        </p>
      )}
      {votedNames.length > 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-lm-text2">
          Con voto registrado: {votedNames.join(", ")}
        </p>
      ) : null}
    </output>
  );
}
