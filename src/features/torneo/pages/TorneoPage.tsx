"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatorImage } from "@/features/shared/components/CreatorImage";
import { CreatorIcon, Icon, IconLabel } from "@/components/icons";
import type { CreatorPhoto } from "@/assets/creators";
import type { IconName } from "@/types/icons";
import {
  getInitialTorneoState,
  getPlayerByName,
  PHASES,
} from "@/features/torneo/data/torneo-players";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { HeroSection } from "@/features/shared/components/ui/HeroSection";
import {
  PhaseCard,
  PhaseDisplay,
  PhaseLabel,
  PhaseSub,
  PhaseTimer,
  PhaseTitle,
} from "@/features/torneo/components/PhaseCard";
import { SectionTitle } from "@/features/shared/components/ui/SectionTitle";
import { useCountdown } from "@/features/shared/hooks/useCountdown";
import { useTorneo } from "@/features/torneo/hooks/useTorneo";
import { formatDuration } from "@/features/shared/lib/utils";
import type { TorneoMatch, TorneoState } from "@/features/shared/lib/types";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import { cn } from "@/lib/cn";

export function TorneoPage() {
  const { state, loading, vote, getLocalVote, phases } = useTorneo(true);
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return (
    <ActivePage id="page-torneo" active>
      <HeroSection
        variant="torneo"
        eyebrow={
          <IconLabel icon="goal" iconSize={14} iconClassName="text-[#ff6b35]">
            Torneo Oficial · 16 Participantes
          </IconLabel>
        }
        title={
          <>
            Torneo
            <br />
            Looksmaxing
          </>
        }
        subtitle="Eliminación directa · El mejor looksmaxer de España"
      />

      <TorneoPhaseCard state={state} loading={loading} onRestart={refresh} />

      <TorneoMatchesSection
        state={state}
        getLocalVote={getLocalVote}
        onVote={async (matchId, name) => {
          await vote(matchId, name);
          refresh();
        }}
        phases={phases}
      />

      <div className="mx-auto mb-8 max-w-[860px] px-5 pb-8 max-md:px-3 max-md:pb-4">
        <SectionTitle center className="mb-4">
          <IconLabel icon="bar-chart-3" iconSize={20}>
            Cuadro del Torneo
          </IconLabel>
        </SectionTitle>
        <TorneoBracket state={state} />
      </div>
    </ActivePage>
  );
}

function TorneoPhaseCard({
  state,
  loading,
  onRestart,
}: {
  state: TorneoState | null;
  loading: boolean;
  onRestart: () => void;
}) {
  const { fb } = useFirebase();
  const cd = useCountdown(state?.phaseEnd);
  const restartEnd = state?.phase === PHASES.TORNEO_ENDED ? getNext23Ms() : null;
  const restartCd = useCountdown(restartEnd);

  useEffect(() => {
    if (state?.phase !== PHASES.TORNEO_ENDED || !restartCd.expired || !fb) return;
    void (async () => {
      const fresh = getInitialTorneoState(Date.now());
      await fb.initTorneoState(fresh as Record<string, unknown>);
      onRestart();
    })();
  }, [state?.phase, restartCd.expired, fb, onRestart]);

  if (loading || !state) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">CARGANDO TORNEO</PhaseLabel>
          <PhaseTitle color="orange">
            <IconLabel icon="hourglass" iconSize={18}>
              Conectando…
            </IconLabel>
          </PhaseTitle>
          <PhaseSub className="mb-0">Por favor espera</PhaseSub>
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.WAITING_OCTAVOS) {
    const end = new Date(state.phaseEnd);
    const horaStr = end.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const diasES = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const mesesES = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const diaStr = `${diasES[end.getDay()]} ${end.getDate()} de ${mesesES[end.getMonth()]}`;
    const nextLabel = state.nextPhaseLabel ?? "Cuartos de Final";

    return (
      <PhaseDisplay>
        <PhaseCard variant="waiting">
          <PhaseLabel color="orange">PRÓXIMAMENTE</PhaseLabel>
          <div className="my-1 font-display text-[clamp(0.9rem,2.5vw,1.3rem)] tracking-[3px] text-lm-text2">
            Torneo de LooksMaxing
          </div>
          <PhaseTitle color="orange" className="text-[clamp(2rem,6vw,4.5rem)]">
            {nextLabel}
          </PhaseTitle>
          <div className="mx-auto my-1 mb-2.5 w-fit max-w-full bg-[linear-gradient(135deg,var(--color-lm-orange),var(--color-lm-gold2))] bg-clip-text font-display text-[clamp(1.4rem,6vw,6rem)] tracking-[6px] text-transparent max-[360px]:tracking-[1px] max-md:tracking-[2px]">
            EMPIEZA A LAS {horaStr}
          </div>
          <div className="mb-3.5 flex items-center justify-center gap-1.5 text-sm font-bold text-lm-text2">
            <Icon name="calendar" size={14} />
            {diaStr}
          </div>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="orange" />
          <div className="mt-3 text-base font-semibold text-lm-text2">
            <IconLabel icon="zap" iconSize={14} className="justify-center">
              El torneo arrancará automáticamente a las {horaStr}
            </IconLabel>
          </div>
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.CUARTOS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="green">CUARTOS EN VIVO · VOTA AHORA</PhaseLabel>
          <PhaseTitle color="green">
            <IconLabel icon="landmark" iconSize={18}>
              CUARTOS DE FINAL
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            30 minutos de votación · El que más votos tenga pasa a Semifinales
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="green" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.SEMIFINALS_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="voting">
          <PhaseLabel color="gold">
            <IconLabel icon="zap" iconSize={12}>
              SEMIFINALES EN VIVO · VOTA AHORA
            </IconLabel>
          </PhaseLabel>
          <PhaseTitle color="gold">
            <IconLabel icon="trophy" iconSize={18}>
              SEMIFINALES
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            30 minutos de votación · Los ganadores van a la Gran Final
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.BREAK_FINAL) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="break">
          <PhaseLabel color="purple">DESCANSO ANTES DE LA GRAN FINAL</PhaseLabel>
          <PhaseTitle color="purple">
            <IconLabel icon="crown" iconSize={18}>
              FINAL EN
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>
            Las Semifinales han concluido · La Gran Final comienza en breve
          </PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="purple" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.FINAL_VOTING) {
    return (
      <PhaseDisplay>
        <PhaseCard variant="semifinals">
          <PhaseLabel color="gold" pulse>
            <IconLabel icon="crown" iconSize={12}>
              GRAN FINAL EN VIVO
            </IconLabel>
          </PhaseLabel>
          <PhaseTitle color="gold">GRAN FINAL</PhaseTitle>
          <PhaseSub>El último enfrentamiento · Solo uno puede ser el Campeón</PhaseSub>
          <PhaseTimer h={cd.h} m={cd.m} s={cd.s} color="gold" />
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  if (state.phase === PHASES.TORNEO_ENDED) {
    const champ = state.champion ?? "?";
    const champInfo = getPlayerByName(champ);

    return (
      <PhaseDisplay>
        <PhaseCard variant="semifinals">
          <div className="mb-2.5 flex items-center justify-center gap-2 text-sm font-black tracking-[3px] text-lm-gold uppercase">
            <Icon name="trophy" size={14} />
            TORNEO FINALIZADO
            <Icon name="trophy" size={14} />
          </div>
          <PhaseTitle color="gold">
            <IconLabel icon="crown" iconSize={18}>
              CAMPEÓN
            </IconLabel>
          </PhaseTitle>
          <PhaseSub>El mejor looksmaxer de España ha sido coronado</PhaseSub>
          <div className="my-4 flex flex-col items-center gap-3">
            <div className="relative flex h-[90px] w-[90px] overflow-hidden rounded-full border-[3px] border-lm-gold text-[2rem]">
              <CreatorImage
                src={champInfo.photo}
                alt={champ}
                className="object-cover"
                sizes="90px"
                fallback={<CreatorIcon name={champ} icon={champInfo.icon} size={36} />}
              />
            </div>
            <div className="mx-auto w-fit max-w-full bg-[linear-gradient(135deg,#fff,var(--color-lm-gold2),var(--color-lm-gold))] bg-clip-text font-display text-[clamp(2rem,7vw,4rem)] tracking-[4px] text-transparent">
              {champ}
            </div>
          </div>
          <div className="mt-7 w-full border-t border-[rgba(232,184,75,0.2)] pt-5 text-center">
            <div className="flex items-center justify-center gap-2 font-display text-[clamp(1rem,3vw,1.6rem)] text-lm-orange">
              <Icon name="refresh-cw" size={18} />
              NUEVO TORNEO EMPIEZA A LAS 23:00
            </div>
            <PhaseTimer
              h={restartCd.h}
              m={restartCd.m}
              s={restartCd.s}
              color="orange"
            />
          </div>
        </PhaseCard>
      </PhaseDisplay>
    );
  }

  return null;
}

function getNext23Ms(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target.getTime();
}

function TorneoMatchesSection({
  state,
  getLocalVote,
  onVote,
  phases,
}: {
  state: TorneoState | null;
  getLocalVote: (id: string) => string | null;
  onVote: (matchId: string, name: string) => Promise<void>;
  phases: typeof PHASES;
}) {
  const breakRemaining = useCountdown(
    state?.phase === phases.BREAK_FINAL ? state.phaseEnd : null,
  );

  if (!state) return null;

  let matches: Record<string, TorneoMatch> | undefined;
  let ids: string[] = [];
  let round = "";
  let title = "";
  let show = false;

  if (state.phase === phases.CUARTOS_VOTING && state.cuartosMatches) {
    matches = state.cuartosMatches;
    ids = ["cua_0", "cua_1", "cua_2", "cua_3"];
    round = "cuartos";
    title = "Cuartos de Final — ¡Vota Ahora!";
    show = true;
  } else if (state.phase === phases.SEMIFINALS_VOTING && state.semisMatches) {
    matches = state.semisMatches;
    ids = ["semi_0", "semi_1"];
    round = "semis";
    title = "Semifinales — ¡Vota Ahora!";
    show = true;
  } else if (state.phase === phases.FINAL_VOTING && state.finalMatch) {
    matches = { final_0: state.finalMatch };
    ids = ["final_0"];
    round = "final";
    title = "Gran Final — ¡Vota al Campeón!";
    show = true;
  } else if (state.phase === phases.TORNEO_ENDED && state.finalMatch) {
    matches = { final_0: state.finalMatch };
    ids = ["final_0"];
    round = "final";
    title = "Gran Final — Resultado Final";
    show = true;
  } else if (state.phase === phases.BREAK_FINAL && state.semisMatches) {
    matches = state.semisMatches;
    ids = ["semi_0", "semi_1"];
    round = "semis";
    title = `Resultados Semifinales — Final en ${formatDuration(breakRemaining.remainingMs)}`;
    show = true;
  }

  if (!show || !matches) return null;

  return (
    <div
      className="mx-auto mb-8 block max-w-[860px] px-5 max-md:px-3"
      id="torneoMatchesSection"
    >
      <SectionTitle center className="mb-4" id="torneoMatchesTitle">
        {title}
      </SectionTitle>
      <div className="flex flex-col gap-3" id="torneoMatchesGrid">
        {ids.map((id, idx) => {
          const m = matches![id];
          if (!m) return null;
          return (
            <MatchCard
              key={id}
              match={m}
              idx={idx}
              round={round}
              state={state}
              myVote={getLocalVote(id)}
              onVote={(name) => onVote(id, name)}
            />
          );
        })}
      </div>
    </div>
  );
}

function MatchCard({
  match,
  idx,
  round,
  state,
  myVote,
  onVote,
}: {
  match: TorneoMatch;
  idx: number;
  round: string;
  state: TorneoState;
  myVote: string | null;
  onVote: (name: string) => void;
}) {
  const p1 = getPlayerByName(match.p1);
  const p2 = getPlayerByName(match.p2);
  const v1 = match.votes?.[match.p1] ?? 0;
  const v2 = match.votes?.[match.p2] ?? 0;
  const total = Math.max(1, v1 + v2);
  const pct1 = Math.round((v1 / total) * 100);
  const pct2 = 100 - pct1;
  const isResolved = !!(match.resolved && match.winner);
  const isVotingPhase =
    (state.phase === PHASES.CUARTOS_VOTING && round === "cuartos") ||
    (state.phase === PHASES.SEMIFINALS_VOTING && round === "semis") ||
    (state.phase === PHASES.FINAL_VOTING && round === "final");
  const canVote = isVotingPhase && !isResolved && !myVote;
  const showBars = isResolved || !!myVote;
  const roundIcon: IconName =
    round === "cuartos" ? "landmark" : round === "semis" ? "trophy" : "crown";
  const roundLabel =
    round === "cuartos" ? "Cuartos" : round === "semis" ? "Semifinal" : "Gran Final";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-lm-border bg-lm-card px-5 py-4 transition-colors duration-300",
        isVotingPhase && !isResolved && "border-[rgba(46,204,113,0.45)]",
        isResolved && "border-[rgba(232,184,75,0.35)]",
      )}
      data-matchid={match.id}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-sm font-extrabold tracking-[1.5px] text-lm-text2 uppercase">
          <Icon name={roundIcon} size={12} />
          {roundLabel} · Partido {idx + 1}
        </span>
        {isResolved ? (
          <span className="flex items-center gap-1 rounded-full border border-[rgba(232,184,75,0.4)] bg-[rgba(232,184,75,0.15)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-gold">
            <Icon name="circle-check" size={12} />
            Terminado
          </span>
        ) : isVotingPhase ? (
          <span className="flex items-center gap-1 rounded-full border border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.15)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-green2">
            <Icon name="radio" size={12} className="text-lm-red2" />
            EN VIVO
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-lm-border bg-[rgba(150,150,150,0.1)] px-2 py-0.5 text-sm font-black tracking-wide text-lm-text2">
            <Icon name="hourglass" size={12} />
            Pendiente
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 max-md:gap-2">
        <MatchSide
          player={match.p1}
          info={p1}
          pct={pct1}
          votes={v1}
          showBars={showBars}
          canVote={canVote}
          isWinner={!!(isResolved && match.winner === match.p1)}
          isLoser={!!(isResolved && match.winner !== match.p1)}
          votedFor={myVote === match.p1}
          onVote={() => onVote(match.p1)}
        />
        <div className="shrink-0 bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))] bg-clip-text font-display text-[1.4rem] text-transparent">
          VS
        </div>
        <MatchSide
          player={match.p2}
          info={p2}
          pct={pct2}
          votes={v2}
          showBars={showBars}
          canVote={canVote}
          isWinner={!!(isResolved && match.winner === match.p2)}
          isLoser={!!(isResolved && match.winner !== match.p2)}
          votedFor={myVote === match.p2}
          onVote={() => onVote(match.p2)}
        />
      </div>
      {myVote && !isResolved && (
        <div className="mt-2 text-center text-sm font-bold text-lm-green2">
          <Icon name="circle-check" size={14} className="inline" /> Votaste por{" "}
          <strong>{myVote}</strong>
        </div>
      )}
      {isResolved && match.winner && (
        <div className="mt-2.5 rounded-[10px] border-[1.5px] border-[rgba(232,184,75,0.6)] bg-[rgba(232,184,75,0.15)] px-4 py-2 text-center text-base font-extrabold tracking-[1.5px] text-lm-gold uppercase">
          <Icon name="trophy" size={14} className="inline text-lm-gold" /> GANADOR ·{" "}
          <span className="mt-0.5 block font-display text-[1.1rem] tracking-[3px] text-white">
            {match.winner}
          </span>
        </div>
      )}
    </div>
  );
}

function MatchSide({
  player,
  info,
  pct,
  votes,
  showBars,
  canVote,
  isWinner,
  isLoser,
  votedFor,
  onVote,
}: {
  player: string;
  info: { photo: CreatorPhoto; icon: IconName };
  pct: number;
  votes: number;
  showBars: boolean;
  canVote: boolean;
  isWinner: boolean;
  isLoser: boolean;
  votedFor: boolean;
  onVote: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!canVote}
      aria-label={`Votar por ${player}`}
      aria-pressed={votedFor}
      className={cn(
        "relative block w-full rounded-xl border-2 border-lm-border bg-lm-bg3 px-2.5 py-2.5 text-center lm-focus-ring transition-all duration-200 max-md:px-2.5 max-md:py-3",
        !canVote && "lm-vote-disabled cursor-not-allowed",
        canVote && "cursor-pointer hover:-translate-y-0.5",
        isWinner &&
          "border-lm-gold2 bg-[rgba(232,184,75,0.12)] shadow-[0_0_16px_rgba(232,184,75,0.2)]",
        isLoser && "border-[rgba(255,71,87,0.35)] opacity-70",
        votedFor && "border-lm-green2 bg-[rgba(46,204,113,0.1)]",
      )}
      onClick={() => onVote()}
    >
      {isWinner && (
        <div className="absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-lm-gold2 text-black">
          <Icon name="crown" size={12} />
        </div>
      )}
      <div className="relative mx-auto mb-1.5 h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-lm-border bg-lm-bg2 text-[1.3rem] max-md:h-[46px] max-md:w-[46px]">
        <CreatorImage
          src={info.photo}
          alt={player}
          className="rounded-full object-cover"
          sizes="50px"
          fallback={<CreatorIcon name={player} icon={info.icon} size={22} />}
        />
      </div>
      <div className="mb-0.5 font-display text-base tracking-wide text-lm-text max-md:text-base">
        {player}
      </div>
      {showBars ? (
        <>
          <div className="my-1 h-1 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-lm-green2),#52f0a8)] transition-[width] duration-800"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-sm font-extrabold text-lm-green2">{pct}%</div>
          <div className="text-sm text-lm-text2">
            {votes} voto{votes !== 1 ? "s" : ""}
          </div>
        </>
      ) : canVote ? (
        <div className="mt-1 flex items-center justify-center gap-1 text-sm font-extrabold text-lm-green2">
          <Icon name="pointer" size={12} />
          Votar
        </div>
      ) : null}
    </button>
  );
}

function TorneoBracket({ state }: { state: TorneoState | null }) {
  if (!state)
    return <div className="flex gap-2 overflow-x-auto pb-3" id="torneoBracketGrid" />;

  const semisWinners = state.cuartosWinners ?? [];
  const champion = state.champion ?? null;
  const fm = state.finalMatch;

  return (
    <div className="flex gap-2 overflow-x-auto pb-3" id="torneoBracketGrid">
      <div className="flex min-w-[110px] shrink-0 flex-col gap-1.5">
        <div className="mb-1 border-b border-lm-border py-1 text-center text-sm font-extrabold tracking-[1.5px] text-lm-text2 uppercase">
          Cuartos de Final
        </div>
        {(["cua_0", "cua_1", "cua_2", "cua_3"] as const).flatMap((matchId) => {
          const cMatch = state.cuartosMatches?.[matchId];
          if (!cMatch) {
            return [
              <BracketSlot key={`${matchId}-a`} tbd />,
              <BracketSlot key={`${matchId}-b`} tbd />,
            ];
          }
          return [cMatch.p1, cMatch.p2].map((pname) => (
            <BracketSlot
              key={`${matchId}-${pname}`}
              name={pname}
              winner={cMatch.resolved && cMatch.winner === pname}
            />
          ));
        })}
      </div>
      <div className="flex min-w-[110px] shrink-0 flex-col gap-1.5">
        <div className="mb-1 border-b border-lm-border py-1 text-center text-sm font-extrabold tracking-[1.5px] text-lm-text2 uppercase">
          Semifinales
        </div>
        {[0, 1, 2, 3].map((i) => {
          const w = semisWinners[i] ?? null;
          const semiMatchId = `semi_${Math.floor(i / 2)}`;
          const semiMatch = state.semisMatches?.[semiMatchId];
          if (!w) return <BracketSlot key={i} tbd />;
          return (
            <BracketSlot
              key={i}
              name={w}
              winner={semiMatch?.resolved && semiMatch.winner === w}
            />
          );
        })}
      </div>
      <div className="flex min-w-[110px] shrink-0 flex-col gap-1.5">
        <div className="mb-1 border-b border-lm-border py-1 text-center text-sm font-extrabold tracking-[1.5px] text-lm-gold uppercase">
          Final
        </div>
        {champion ? (
          <BracketSlot name={champion} winner gold />
        ) : state.semisWinners && state.semisWinners.length >= 2 ? (
          [state.semisWinners[0], state.semisWinners[1]].map((w) => (
            <BracketSlot key={w} name={w} winner={fm?.resolved && fm.winner === w} />
          ))
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(232,184,75,0.4)] bg-lm-card px-2 py-1.5 opacity-40">
            <Icon name="crown" size={12} className="text-lm-gold" />
            <div className="max-w-[75px] truncate text-sm font-extrabold text-lm-gold">
              Por decidir
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BracketSlot({
  name,
  winner,
  tbd,
  gold,
}: {
  name?: string;
  winner?: boolean;
  tbd?: boolean;
  gold?: boolean;
}) {
  if (tbd) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-lm-border bg-lm-card px-2 py-1.5 opacity-40">
        <div className="max-w-[75px] truncate text-sm font-extrabold text-lm-text2">
          — TBD
        </div>
      </div>
    );
  }
  const p = getPlayerByName(name!);
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-lm-border bg-lm-card px-2 py-1.5",
        winner && "border-[rgba(232,184,75,0.5)] bg-[rgba(232,184,75,0.06)]",
        gold && "border-lm-gold2 bg-[rgba(232,184,75,0.12)]",
      )}
    >
      <div className="relative h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full border border-lm-border bg-lm-bg3 text-base">
        <CreatorImage
          src={p.photo}
          alt={p.name}
          className="rounded-full object-cover"
          sizes="22px"
          fallback={<CreatorIcon name={p.name} icon={p.icon} size={12} />}
        />
      </div>
      <div
        className={cn(
          "max-w-[75px] truncate text-sm font-extrabold text-lm-text",
          gold && "text-lm-gold2",
        )}
      >
        {gold ? (
          <span className="flex items-center gap-1">
            <Icon name="crown" size={10} />
            {p.name}
          </span>
        ) : (
          p.name
        )}
      </div>
    </div>
  );
}
