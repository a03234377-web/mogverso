"use client";

import type { ReactNode } from "react";
import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import { getPlayerByName, PHASES } from "@/features/torneo/data/torneo-players";
import { useTorneoBracketPreview } from "@/features/torneo/hooks/useTorneoBracketPreview";
import {
  getTorneoMatchVoteStats,
  getTorneoPlayerVotes,
} from "@/features/torneo/lib/torneo-match-votes";
import { CUARTOS_IDS, OCTAVOS_IDS, SEMIS_IDS } from "@/lib/torneo-bracket";
import type { TorneoMatch, TorneoState } from "@/types/looksmax";
import { cn } from "@/lib/cn";

type BracketTone = "orange" | "green" | "purple" | "gold";
type BracketRound = "octavos" | "cuartos" | "semis" | "final";

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

  const octavosWinners = state?.octavosWinners ?? [];
  const cuartosWinners = state?.cuartosWinners ?? [];
  const champion = state?.champion ?? null;
  const fm = state?.finalMatch;
  const octavosVoting = isRoundVoting(state, "octavos");

  return (
    <TorneoBracketShell>
      <BracketColumn title="Octavos" tone="orange">
        {OCTAVOS_IDS.map((matchId, i) => {
          const oMatch = octavosSource?.[matchId];
          if (!oMatch) {
            return (
              <BracketMatchGroup
                key={matchId}
                tone="orange"
                matchNum={i + 1}
                advanceLabel={`→ Cuartos ${Math.floor(i / 2) + 1}`}
                pending
              />
            );
          }
          return (
            <BracketMatchGroup
              key={matchId}
              tone="orange"
              match={oMatch}
              matchNum={i + 1}
              advanceLabel={`→ Cuartos ${Math.floor(i / 2) + 1}`}
              votingActive={octavosVoting && !oMatch.resolved}
              myVote={getLocalVote?.(matchId) ?? null}
              onVoteClick={() => scrollToTorneoMatch(matchId)}
            />
          );
        })}
      </BracketColumn>

      <BracketColumn title="Cuartos" tone="green">
        {CUARTOS_IDS.map((matchId, i) => {
          const cMatch = state?.cuartosMatches?.[matchId];
          if (cMatch) {
            return (
              <BracketMatchGroup
                key={matchId}
                tone="green"
                match={cMatch}
                matchNum={i + 1}
                advanceLabel={`→ Semifinal ${Math.floor(i / 2) + 1}`}
                votingActive={isRoundVoting(state, "cuartos") && !cMatch.resolved}
                myVote={getLocalVote?.(matchId) ?? null}
                onVoteClick={() => scrollToTorneoMatch(matchId)}
              />
            );
          }
          const w1 = octavosWinners[i * 2];
          const w2 = octavosWinners[i * 2 + 1];
          if (w1 && w2) {
            return (
              <BracketMatchGroup
                key={matchId}
                tone="green"
                matchNum={i + 1}
                p1={w1}
                p2={w2}
                advanceLabel={`→ Semifinal ${Math.floor(i / 2) + 1}`}
              />
            );
          }
          return (
            <BracketMatchGroup
              key={matchId}
              tone="green"
              matchNum={i + 1}
              advanceLabel={`→ Semifinal ${Math.floor(i / 2) + 1}`}
              pending
            />
          );
        })}
      </BracketColumn>

      <BracketColumn title="Semifinales" tone="purple">
        {SEMIS_IDS.map((matchId, i) => {
          const semiMatch = state?.semisMatches?.[matchId];
          if (semiMatch) {
            return (
              <BracketMatchGroup
                key={matchId}
                tone="purple"
                match={semiMatch}
                matchNum={i + 1}
                advanceLabel="→ Gran Final"
                votingActive={isRoundVoting(state, "semis") && !semiMatch.resolved}
                myVote={getLocalVote?.(matchId) ?? null}
                onVoteClick={() => scrollToTorneoMatch(matchId)}
              />
            );
          }
          const w1 = cuartosWinners[i * 2];
          const w2 = cuartosWinners[i * 2 + 1];
          if (w1 && w2) {
            return (
              <BracketMatchGroup
                key={matchId}
                tone="purple"
                matchNum={i + 1}
                p1={w1}
                p2={w2}
                advanceLabel="→ Gran Final"
              />
            );
          }
          return (
            <BracketMatchGroup
              key={matchId}
              tone="purple"
              matchNum={i + 1}
              advanceLabel="→ Gran Final"
              pending
            />
          );
        })}
      </BracketColumn>

      <BracketColumn title="Final" tone="gold">
        {champion ? (
          <BracketSlot name={champion} tone="gold" winner gold />
        ) : fm ? (
          <BracketMatchGroup
            tone="gold"
            match={fm}
            matchNum={1}
            advanceLabel="→ Campeón"
            votingActive={isRoundVoting(state, "final") && !fm.resolved}
            myVote={getLocalVote?.("final_0") ?? null}
            onVoteClick={() => scrollToTorneoMatch("final_0")}
          />
        ) : state?.semisWinners && state.semisWinners.length >= 2 ? (
          <BracketMatchGroup
            tone="gold"
            matchNum={1}
            p1={state.semisWinners[0]}
            p2={state.semisWinners[1]}
            advanceLabel="→ Campeón"
          />
        ) : (
          <BracketSlot tone="gold" pending finalPending />
        )}
      </BracketColumn>
    </TorneoBracketShell>
  );
}

function TorneoBracketShell({
  children,
  empty,
}: {
  children?: ReactNode;
  empty?: boolean;
}) {
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
        <div className="flex gap-3 overflow-x-auto pb-1">{children}</div>
      )}
    </div>
  );
}

function BracketColumn({
  title,
  tone,
  children,
}: {
  title: string;
  tone: BracketTone;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-[148px] shrink-0 flex-col gap-2.5">
      <div
        className={cn(
          "torneo-bracket-col-title mb-0.5 border-b py-1.5 text-center lm-type-label max-md:text-base",
          `torneo-bracket-col-title--${tone}`,
        )}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function BracketMatchGroup({
  tone,
  match,
  p1,
  p2,
  matchNum,
  advanceLabel,
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
  advanceLabel: string;
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
        "torneo-bracket-match rounded-xl border p-1.5",
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
          ? `Ir a votar: ${player1} contra ${player2}. ${advanceLabel}`
          : undefined
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-1 flex items-center justify-between gap-1 px-0.5">
        <span className="truncate text-[10px] font-bold tracking-wide text-lm-text2 uppercase">
          Duelo {matchNum}
        </span>
        {votingActive ? (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full border border-[rgba(46,204,113,0.45)] bg-[rgba(46,204,113,0.12)] px-1.5 py-px text-[9px] font-black tracking-wide text-lm-green2 uppercase">
            <Icon name="radio" size={8} className="text-lm-red2" />
            Votar
          </span>
        ) : myVote ? (
          <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-lm-green2">
            <Icon name="circle-check" size={9} />
            Votado
          </span>
        ) : showVotes && stats?.leader ? (
          <span
            className="max-w-[4.5rem] truncate text-[9px] font-bold text-lm-green2"
            title={`Va ganando ${stats.leader}`}
          >
            ↑ {stats.leader}
          </span>
        ) : null}
      </div>

      {pending || !player1 || !player2 ? (
        <div className="flex flex-col gap-1">
          <BracketSlot tone={tone} pending compact />
          <div className="torneo-bracket-vs py-0.5 text-center text-[10px] font-black tracking-wider text-lm-text2">
            VS
          </div>
          <BracketSlot tone={tone} pending compact />
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <BracketSlot
            tone={tone}
            name={player1}
            votes={showVotes ? votes1 : undefined}
            winner={resolved ? match!.winner === player1 : false}
            leading={!resolved && stats?.leader === player1 && showVotes}
            voted={myVote === player1}
            compact
          />
          <div
            className={cn(
              "torneo-bracket-vs py-0.5 text-center text-[10px] font-black tracking-wider",
              votingActive ? "text-lm-green2" : "text-lm-text2",
            )}
          >
            {showVotes ? `${votes1}–${votes2}` : "VS"}
          </div>
          <BracketSlot
            tone={tone}
            name={player2}
            votes={showVotes ? votes2 : undefined}
            winner={resolved ? match!.winner === player2 : false}
            leading={!resolved && stats?.leader === player2 && showVotes}
            voted={myVote === player2}
            compact
          />
        </div>
      )}

      <div
        className={cn(
          "torneo-bracket-advance mt-1.5 flex items-center justify-center gap-0.5 border-t pt-1 text-[10px] font-semibold",
          `torneo-bracket-advance--${tone}`,
        )}
      >
        <span className="truncate">{advanceLabel}</span>
      </div>

      {showVotes && stats && !resolved ? (
        <p className="mt-1 text-center text-[9px] font-semibold text-lm-text2">
          {stats.isTie ? (
            <>Empate · {stats.v1} votos</>
          ) : (
            <>
              <Icon
                name="trending-up"
                size={9}
                className="mr-0.5 inline text-lm-green2"
              />
              <span className="text-lm-green2">Gana {stats.leader}</span>
              <span className="text-lm-text2">
                {" "}
                · {stats.v1}–{stats.v2}
              </span>
            </>
          )}
        </p>
      ) : null}

      {clickable ? (
        <p className="mt-1 text-center text-[9px] font-semibold text-lm-green2 opacity-90">
          Toca para votar
        </p>
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
          "min-w-0 flex-1 truncate text-sm font-bold",
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
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-px text-[10px] font-black tabular-nums",
            leading
              ? "bg-[rgba(46,204,113,0.2)] text-lm-green2"
              : "bg-white/8 text-lm-text2",
          )}
        >
          {votes}
        </span>
      ) : null}
      {voted ? (
        <Icon name="circle-check" size={12} className="shrink-0 text-lm-green2" />
      ) : leading ? (
        <Icon name="trending-up" size={11} className="shrink-0 text-lm-green2" />
      ) : null}
    </div>
  );
}
