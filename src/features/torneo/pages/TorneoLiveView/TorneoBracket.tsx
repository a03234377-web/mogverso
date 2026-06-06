"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import { getPlayerByName, PHASES } from "@/features/torneo/data/torneo-players";
import { useTorneoBracketPreview } from "@/features/torneo/hooks/useTorneoBracketPreview";
import {
  getTorneoMatchVoteStats,
  getTorneoPlayerVotes,
} from "@/features/torneo/lib/torneo-match-votes";
import {
  CUARTOS_IDS,
  getCuartosWinnersForBracket,
  getFinalistsForBracket,
  getOctavosWinnersForBracket,
  OCTAVOS_IDS,
  resolveRoundMatches,
  SEMIS_IDS,
} from "@/lib/torneo-bracket";
import { isTorneoVotingPhaseExpired } from "@/lib/torneo-schedule";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";
import { cn } from "@/lib/cn";

type BracketTone = "orange" | "green" | "purple" | "gold";
type BracketRound = "octavos" | "cuartos" | "semis" | "final";

const BRACKET_ROWS = 8;

const BRACKET_WIRE_COLORS = {
  "oct-cua": "rgba(255, 107, 53, 0.5)",
  "cua-sem": "rgba(46, 204, 113, 0.5)",
  "sem-fin": "rgba(168, 85, 247, 0.5)",
} as const;

function bracketNodeRow(round: BracketRound, index: number): string {
  if (round === "octavos") return `${index + 2} / ${index + 3}`;
  if (round === "cuartos") return `${index * 2 + 2} / ${index * 2 + 4}`;
  if (round === "semis") return `${index * 4 + 2} / ${index * 4 + 6}`;
  return "2 / 10";
}

const VOTING_PHASE_BY_ROUND: Record<BracketRound, string> = {
  octavos: PHASES.OCTAVOS_VOTING,
  cuartos: PHASES.CUARTOS_VOTING,
  semis: PHASES.SEMIFINALS_VOTING,
  final: PHASES.FINAL_VOTING,
};

function scrollToTorneoMatch(matchId: string) {
  const el = document.getElementById(`torneo-match-${matchId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("torneo-match-highlight");
  window.setTimeout(() => el.classList.remove("torneo-match-highlight"), 1800);
}

function isRoundVoting(state: TorneoState | null, round: BracketRound): boolean {
  if (!state) return false;
  return state.phase === VOTING_PHASE_BY_ROUND[round];
}

function getBracketFocusRound(
  phase: string | undefined,
  cuartosPeriodExpired?: boolean,
): BracketRound {
  switch (phase) {
    case PHASES.BREAK_CUARTOS:
      return cuartosPeriodExpired ? "semis" : "cuartos";
    case PHASES.CUARTOS_VOTING:
      return "cuartos";
    case PHASES.SEMIFINALS_PROMO:
    case PHASES.SEMIFINALS_VOTING:
      return "semis";
    case PHASES.BREAK_FINAL:
    case PHASES.FINAL_VOTING:
    case PHASES.TORNEO_ENDED:
      return "final";
    default:
      return "octavos";
  }
}

const BRACKET_ROUND_COLUMN: Record<BracketRound, number> = {
  octavos: 1,
  cuartos: 3,
  semis: 5,
  final: 7,
};

export function TorneoBracket({
  state,
  getLocalVote,
}: {
  state: TorneoState | null;
  getLocalVote?: (matchId: string) => string | null;
}) {
  const needsPreview =
    !state?.matches?.oct_0 &&
    (state?.phase === PHASES.WAITING_OCTAVOS || !state?.matches);
  const previewMatches = useTorneoBracketPreview(needsPreview);
  const octavosSource = state?.matches?.oct_0
    ? state.matches
    : (previewMatches ?? state?.matches);

  if (!state && !previewMatches) {
    return <TorneoBracketShell empty />;
  }

  const octavosWinners = getOctavosWinnersForBracket(state);
  const cuartosPeriodExpired =
    state?.phase === PHASES.BREAK_CUARTOS &&
    isTorneoVotingPhaseExpired({ ...state, phase: PHASES.CUARTOS_VOTING });
  let cuartosWinners = getCuartosWinnersForBracket(state);
  if (
    cuartosPeriodExpired &&
    cuartosWinners.filter(Boolean).length < 2 &&
    state?.cuartosMatches?.cua_0
  ) {
    cuartosWinners = resolveRoundMatches(CUARTOS_IDS, state.cuartosMatches).winners;
  }
  const champion = state?.champion ?? null;
  const fm = state?.finalMatch;
  const finalists = getFinalistsForBracket(state);
  const octavosVoting = isRoundVoting(state, "octavos");
  const focusRound = getBracketFocusRound(state?.phase, cuartosPeriodExpired);

  return (
    <TorneoBracketShell focusRound={focusRound}>
      <BracketRoundAnchor round="octavos" column={BRACKET_ROUND_COLUMN.octavos} />
      <BracketRoundAnchor round="cuartos" column={BRACKET_ROUND_COLUMN.cuartos} />
      <BracketRoundAnchor round="semis" column={BRACKET_ROUND_COLUMN.semis} />
      <BracketRoundAnchor round="final" column={BRACKET_ROUND_COLUMN.final} />

      <BracketRoundHeader title="Octavos" tone="orange" column={1} />
      <BracketRoundHeader title="Cuartos" tone="green" column={3} />
      <BracketRoundHeader title="Semifinales" tone="purple" column={5} />
      <BracketRoundHeader title="Final" tone="gold" column={7} />

      {OCTAVOS_IDS.map((matchId, i) => {
        const oMatch = octavosSource?.[matchId];
        return (
          <div
            key={matchId}
            className="torneo-bracket-node torneo-bracket-node--out"
            style={{ gridColumn: 1, gridRow: bracketNodeRow("octavos", i) }}
          >
            {!oMatch ? (
              <BracketMatchGroup tone="orange" matchNum={i + 1} pending />
            ) : (
              <BracketMatchGroup
                tone="orange"
                match={oMatch}
                matchNum={i + 1}
                votingActive={octavosVoting && !oMatch.resolved}
                myVote={getLocalVote?.(matchId) ?? null}
                onVoteClick={() => scrollToTorneoMatch(matchId)}
              />
            )}
          </div>
        );
      })}

      <BracketWires column={2} pairs={4} color={BRACKET_WIRE_COLORS["oct-cua"]} />

      {CUARTOS_IDS.map((matchId, i) => {
        const cMatch = state?.cuartosMatches?.[matchId];
        const w1 = octavosWinners[i * 2];
        const w2 = octavosWinners[i * 2 + 1];
        return (
          <div
            key={matchId}
            className="torneo-bracket-node torneo-bracket-node--in torneo-bracket-node--out"
            style={{ gridColumn: 3, gridRow: bracketNodeRow("cuartos", i) }}
          >
            {cMatch ? (
              <BracketMatchGroup
                tone="green"
                match={cMatch}
                matchNum={i + 1}
                votingActive={isRoundVoting(state, "cuartos") && !cMatch.resolved}
                myVote={getLocalVote?.(matchId) ?? null}
                onVoteClick={() => scrollToTorneoMatch(matchId)}
              />
            ) : w1 && w2 ? (
              <BracketMatchGroup tone="green" matchNum={i + 1} p1={w1} p2={w2} />
            ) : (
              <BracketMatchGroup tone="green" matchNum={i + 1} pending />
            )}
          </div>
        );
      })}

      <BracketWires column={4} pairs={2} color={BRACKET_WIRE_COLORS["cua-sem"]} />

      {SEMIS_IDS.map((matchId, i) => {
        const semiMatch = state?.semisMatches?.[matchId];
        const w1 = cuartosWinners[i * 2];
        const w2 = cuartosWinners[i * 2 + 1];
        return (
          <div
            key={matchId}
            className="torneo-bracket-node torneo-bracket-node--in torneo-bracket-node--out"
            style={{ gridColumn: 5, gridRow: bracketNodeRow("semis", i) }}
          >
            {semiMatch ? (
              <BracketMatchGroup
                tone="purple"
                match={semiMatch}
                matchNum={i + 1}
                votingActive={isRoundVoting(state, "semis") && !semiMatch.resolved}
                myVote={getLocalVote?.(matchId) ?? null}
                onVoteClick={() => scrollToTorneoMatch(matchId)}
              />
            ) : w1 && w2 ? (
              <BracketMatchGroup tone="purple" matchNum={i + 1} p1={w1} p2={w2} />
            ) : (
              <BracketMatchGroup tone="purple" matchNum={i + 1} pending />
            )}
          </div>
        );
      })}

      <BracketWires column={6} pairs={1} color={BRACKET_WIRE_COLORS["sem-fin"]} />

      <div
        className="torneo-bracket-node torneo-bracket-node--final torneo-bracket-node--in"
        style={{ gridColumn: 7, gridRow: bracketNodeRow("final", 0) }}
      >
        {champion ? (
          <BracketSlot name={champion} tone="gold" winner gold />
        ) : fm ? (
          <BracketMatchGroup
            tone="gold"
            match={fm}
            matchNum={1}
            votingActive={isRoundVoting(state, "final") && !fm.resolved}
            myVote={getLocalVote?.("final_0") ?? null}
            onVoteClick={() => scrollToTorneoMatch("final_0")}
          />
        ) : finalists.p1 && finalists.p2 ? (
          <BracketMatchGroup
            tone="gold"
            matchNum={1}
            p1={finalists.p1}
            p2={finalists.p2}
            votingActive={isRoundVoting(state, "final") && !finalists.preview}
            onVoteClick={
              isRoundVoting(state, "final")
                ? () => scrollToTorneoMatch("final_0")
                : undefined
            }
          />
        ) : (
          <BracketSlot tone="gold" pending finalPending />
        )}
      </div>
    </TorneoBracketShell>
  );
}

function TorneoBracketShell({
  children,
  empty,
  focusRound,
}: {
  children?: ReactNode;
  empty?: boolean;
  focusRound?: BracketRound;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useLayoutEffect(() => {
    if (empty || !focusRound) return;
    const scroller = scrollRef.current;
    if (!scroller) return;

    const anchor = scroller.querySelector<HTMLElement>(
      `#torneo-bracket-round-${focusRound}`,
    );
    if (!anchor) return;

    const targetLeft =
      anchor.offsetLeft - (scroller.clientWidth - anchor.offsetWidth) / 2;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    scroller.scrollTo({
      left: Math.max(0, Math.min(targetLeft, maxScroll)),
      behavior: hasScrolledRef.current ? "smooth" : "auto",
    });
    hasScrolledRef.current = true;
  }, [empty, focusRound]);

  return (
    <div
      className={cn(
        "torneo-bracket-shell rounded-2xl border px-3 py-4 max-md:px-2",
        empty && "min-h-[120px]",
      )}
      id="torneoBracketGrid"
    >
      {empty ? (
        <p className="py-6 text-center text-sm text-lm-text2">
          Cargando cuadro del torneo…
        </p>
      ) : (
        <div ref={scrollRef} className="torneo-bracket-scroll">
          <div className="torneo-bracket-tree">{children}</div>
        </div>
      )}
    </div>
  );
}

function BracketRoundAnchor({
  round,
  column,
}: {
  round: BracketRound;
  column: number;
}) {
  return (
    <div
      id={`torneo-bracket-round-${round}`}
      className="torneo-bracket-round-anchor pointer-events-none"
      style={{ gridColumn: column, gridRow: "1 / -1" }}
      aria-hidden
    />
  );
}

function BracketRoundHeader({
  title,
  tone,
  column,
}: {
  title: string;
  tone: BracketTone;
  column: number;
}) {
  return (
    <div
      className={cn(
        "torneo-bracket-col-title border-b py-1.5 text-center lm-type-label max-md:text-base",
        `torneo-bracket-col-title--${tone}`,
      )}
      style={{ gridColumn: column, gridRow: 1 }}
    >
      {title}
    </div>
  );
}

function BracketWires({
  column,
  pairs,
  color,
}: {
  column: number;
  pairs: number;
  color: string;
}) {
  const totalSlots = pairs * 2;
  const paths: string[] = [];

  for (let p = 0; p < pairs; p++) {
    const yTop = ((p * 2 + 0.5) / totalSlots) * 100;
    const yBottom = ((p * 2 + 1.5) / totalSlots) * 100;
    const yMid = ((p * 2 + 1) / totalSlots) * 100;
    paths.push(`M 0 ${yTop} H 50 V ${yMid} M 0 ${yBottom} H 50 V ${yMid} H 100`);
  }

  return (
    <div
      className="torneo-bracket-wires"
      style={{ gridColumn: column, gridRow: `2 / ${BRACKET_ROWS + 2}` }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

function BracketMatchGroup({
  tone,
  match,
  p1,
  p2,
  matchNum,
  pending,
  votingActive,
  myVote,
  onVoteClick,
}: {
  tone: BracketTone;
  match?: TorneoMatch;
  p1?: string;
  p2?: string;
  matchNum: number;
  pending?: boolean;
  votingActive?: boolean;
  myVote?: string | null;
  onVoteClick?: () => void;
}) {
  const player1 = match?.p1 ?? p1;
  const player2 = match?.p2 ?? p2;
  const resolved = match?.resolved && match.winner;
  const clickable = votingActive && !!onVoteClick;
  const stats = match ? getTorneoMatchVoteStats(match) : null;
  const votes1 = match && player1 ? getTorneoPlayerVotes(match, player1) : 0;
  const votes2 = match && player2 ? getTorneoPlayerVotes(match, player2) : 0;
  const showVotes = !!match && (stats?.total ?? 0) > 0;

  const handleClick = () => {
    if (!clickable) return;
    onVoteClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onVoteClick?.();
    }
  };

  return (
    <div
      className={cn(
        "torneo-bracket-match rounded-lg border p-2",
        `torneo-bracket-match--${tone}`,
        pending && "torneo-bracket-match--pending",
        votingActive && "torneo-bracket-match--voting",
        clickable && "torneo-bracket-match--clickable cursor-pointer",
        resolved && "torneo-bracket-match--resolved",
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={
        clickable && player1 && player2
          ? myVote
            ? `Ir al duelo: ${player1} contra ${player2}`
            : `Ir a votar: ${player1} contra ${player2}`
          : undefined
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold tracking-wide text-lm-text2 uppercase">
          Duelo {matchNum}
        </span>
        {votingActive && myVote ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-lm-border bg-white/8 px-1.5 py-px text-[9px] font-black tracking-wide text-lm-text2 uppercase">
            Ir
          </span>
        ) : votingActive ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-[rgba(46,204,113,0.45)] bg-[rgba(46,204,113,0.12)] px-1.5 py-px text-[9px] font-black tracking-wide text-lm-green2 uppercase">
            <Icon name="radio" size={8} className="text-lm-red2" />
            Votar
          </span>
        ) : myVote ? (
          <Icon
            name="circle-check"
            size={11}
            className="shrink-0 text-lm-green2"
            aria-label="Votado"
          />
        ) : null}
      </div>

      {pending || !player1 || !player2 ? (
        <div className="torneo-bracket-players divide-y divide-white/6 rounded-md bg-black/20">
          <BracketPlayerRow tone={tone} pending />
          <BracketPlayerRow tone={tone} pending />
        </div>
      ) : (
        <div className="torneo-bracket-players divide-y divide-white/6 rounded-md bg-black/20">
          <BracketPlayerRow
            tone={tone}
            name={player1}
            votes={showVotes ? votes1 : undefined}
            winner={resolved ? match!.winner === player1 : false}
            leading={!resolved && stats?.leader === player1 && showVotes}
            voted={myVote === player1}
          />
          <BracketPlayerRow
            tone={tone}
            name={player2}
            votes={showVotes ? votes2 : undefined}
            winner={resolved ? match!.winner === player2 : false}
            leading={!resolved && stats?.leader === player2 && showVotes}
            voted={myVote === player2}
          />
        </div>
      )}
    </div>
  );
}

function BracketPlayerRow({
  tone,
  name,
  winner,
  leading,
  voted,
  votes,
  pending,
}: {
  tone: BracketTone;
  name?: string;
  winner?: boolean;
  leading?: boolean;
  voted?: boolean;
  votes?: number;
  pending?: boolean;
}) {
  if (pending) {
    return (
      <div className="flex items-center gap-1.5 px-1.5 py-1.5">
        <div
          className={cn(
            "h-5 w-5 shrink-0 rounded-full border opacity-40",
            `torneo-bracket-avatar--${tone}`,
          )}
        />
        <span className="text-xs font-bold text-lm-text2 opacity-50">—</span>
      </div>
    );
  }

  const p = getPlayerByName(name!);
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-1.5 py-1.5",
        voted && "bg-[rgba(46,204,113,0.1)]",
        winner && "bg-[rgba(232,184,75,0.12)]",
      )}
      title={p.name}
    >
      <div
        className={cn(
          "relative h-5 w-5 shrink-0 overflow-hidden rounded-full border",
          `torneo-bracket-avatar--${tone}`,
        )}
      >
        <CreatorImage
          src={p.photo}
          alt={p.name}
          className="rounded-full object-cover"
          sizes="20px"
          fallback={<CreatorIcon name={p.name} icon={p.icon} size={10} />}
        />
      </div>
      <span
        className={cn(
          "torneo-bracket-slot-name min-w-0 flex-1 text-xs leading-tight font-bold",
          winner ? "text-lm-gold" : "text-lm-text",
        )}
      >
        {p.name}
      </span>
      {typeof votes === "number" ? (
        <span className="shrink-0 text-[10px] font-black text-lm-text2 tabular-nums">
          {votes}
        </span>
      ) : null}
      {voted ? (
        <Icon name="circle-check" size={10} className="shrink-0 text-lm-green2" />
      ) : winner ? (
        <Icon name="crown" size={10} className="shrink-0 text-lm-gold" />
      ) : leading ? (
        <Icon
          name="trending-up"
          size={10}
          className="shrink-0 text-lm-gold"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function BracketSlot({
  name,
  winner,
  leading,
  voted,
  votes,
  pending,
  gold,
  finalPending,
  compact,
  tone = "orange",
}: {
  name?: string;
  winner?: boolean;
  leading?: boolean;
  voted?: boolean;
  votes?: number;
  pending?: boolean;
  gold?: boolean;
  finalPending?: boolean;
  compact?: boolean;
  tone?: BracketTone;
}) {
  if (pending) {
    return (
      <div
        className={cn(
          "torneo-bracket-slot flex items-center gap-2 rounded-lg px-2 py-1.5",
          compact && "torneo-bracket-slot--compact",
          `torneo-bracket-slot--${tone}`,
          "torneo-bracket-slot--pending",
          finalPending && "torneo-bracket-slot--final-pending",
        )}
      >
        {finalPending ? (
          <>
            <Icon name="crown" size={14} className="shrink-0 text-lm-gold" />
            <span className="truncate text-sm font-bold text-lm-gold">Por decidir</span>
          </>
        ) : (
          <span className="truncate text-sm font-bold opacity-70">—</span>
        )}
      </div>
    );
  }

  const p = getPlayerByName(name!);
  return (
    <div
      className={cn(
        "torneo-bracket-slot flex items-center gap-2 rounded-lg px-2 py-1.5",
        compact && "torneo-bracket-slot--compact",
        `torneo-bracket-slot--${tone}`,
        winner && "torneo-bracket-slot--winner",
        leading && "torneo-bracket-slot--leading",
        voted && "torneo-bracket-slot--voted",
        gold && "torneo-bracket-slot--champion",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border-2",
          compact ? "h-6 w-6" : "h-7 w-7",
          `torneo-bracket-avatar--${tone}`,
        )}
      >
        <CreatorImage
          src={p.photo}
          alt={p.name}
          className="rounded-full object-cover"
          sizes={compact ? "24px" : "28px"}
          fallback={
            <CreatorIcon name={p.name} icon={p.icon} size={compact ? 12 : 14} />
          }
        />
      </div>
      <div
        className={cn(
          "torneo-bracket-slot-name min-w-0 flex-1 text-sm leading-tight font-bold",
          gold ? "text-lm-gold" : "text-lm-text",
        )}
      >
        {gold ? (
          <span className="flex items-center gap-1">
            <Icon name="crown" size={11} className="shrink-0 text-lm-gold" />
            {p.name}
          </span>
        ) : (
          p.name
        )}
      </div>
      {typeof votes === "number" ? (
        <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-px text-[10px] font-black text-lm-text2 tabular-nums">
          {votes}
        </span>
      ) : null}
      {voted ? (
        <Icon name="circle-check" size={12} className="shrink-0 text-lm-green2" />
      ) : leading ? (
        <Icon
          name="trending-up"
          size={11}
          className="shrink-0 text-lm-gold"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
