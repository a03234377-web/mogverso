"use client";

import type { ReactNode } from "react";
import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import { getPlayerByName } from "@/features/torneo/data/torneo-players";
import { useTorneoBracketPreview } from "@/features/torneo/hooks/useTorneoBracketPreview";
import { PHASES } from "@/features/torneo/data/torneo-players";
import { OCTAVOS_IDS } from "@/lib/torneo-bracket";
import type { TorneoState } from "@/types/looksmax";
import { cn } from "@/lib/cn";

type BracketTone = "orange" | "green" | "purple" | "gold";

export function TorneoBracket({ state }: { state: TorneoState | null }) {
  const needsPreview =
    !state?.matches?.oct_0 &&
    (state?.phase === PHASES.WAITING_OCTAVOS || !state?.matches);
  const previewMatches = useTorneoBracketPreview(needsPreview);
  const octavosSource = state?.matches?.oct_0
    ? state.matches
    : previewMatches ?? state?.matches;

  if (!state && !previewMatches) {
    return <TorneoBracketShell empty />;
  }

  const octavosWinners = state?.octavosWinners ?? [];
  const cuartosWinners = state?.cuartosWinners ?? [];
  const champion = state?.champion ?? null;
  const fm = state?.finalMatch;

  return (
    <TorneoBracketShell>
      <BracketColumn title="Octavos" tone="orange">
        {OCTAVOS_IDS.flatMap((matchId) => {
          const oMatch = octavosSource?.[matchId];
          if (!oMatch) {
            return [
              <BracketSlot key={`${matchId}-a`} tone="orange" pending />,
              <BracketSlot key={`${matchId}-b`} tone="orange" pending />,
            ];
          }
          return [oMatch.p1, oMatch.p2].map((pname) => (
            <BracketSlot
              key={`${matchId}-${pname}`}
              tone="orange"
              name={pname}
              winner={oMatch.resolved && oMatch.winner === pname}
            />
          ));
        })}
      </BracketColumn>

      <BracketColumn title="Cuartos" tone="green">
        {(["cua_0", "cua_1", "cua_2", "cua_3"] as const).flatMap((matchId, i) => {
          const cMatch = state?.cuartosMatches?.[matchId];
          if (!cMatch) {
            const w1 = octavosWinners[i * 2];
            const w2 = octavosWinners[i * 2 + 1];
            if (w1 && w2) {
              return [
                <BracketSlot key={`${matchId}-a`} tone="green" name={w1} />,
                <BracketSlot key={`${matchId}-b`} tone="green" name={w2} />,
              ];
            }
            return [
              <BracketSlot key={`${matchId}-a`} tone="green" pending />,
              <BracketSlot key={`${matchId}-b`} tone="green" pending />,
            ];
          }
          return [cMatch.p1, cMatch.p2].map((pname) => (
            <BracketSlot
              key={`${matchId}-${pname}`}
              tone="green"
              name={pname}
              winner={cMatch.resolved && cMatch.winner === pname}
            />
          ));
        })}
      </BracketColumn>

      <BracketColumn title="Semifinales" tone="purple">
        {[0, 1, 2, 3].map((i) => {
          const w = cuartosWinners[i] ?? null;
          const semiMatchId = `semi_${Math.floor(i / 2)}`;
          const semiMatch = state?.semisMatches?.[semiMatchId];
          if (!w) return <BracketSlot key={i} tone="purple" pending />;
          return (
            <BracketSlot
              key={i}
              tone="purple"
              name={w}
              winner={semiMatch?.resolved && semiMatch.winner === w}
            />
          );
        })}
      </BracketColumn>

      <BracketColumn title="Final" tone="gold">
        {champion ? (
          <BracketSlot name={champion} tone="gold" winner gold />
        ) : state?.semisWinners && state.semisWinners.length >= 2 ? (
          [state.semisWinners[0], state.semisWinners[1]].map((w) => (
            <BracketSlot
              key={w}
              tone="gold"
              name={w}
              winner={fm?.resolved && fm.winner === w}
            />
          ))
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
    <div className="flex min-w-[118px] shrink-0 flex-col gap-2">
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

function BracketSlot({
  name,
  winner,
  pending,
  gold,
  finalPending,
  tone = "orange",
}: {
  name?: string;
  winner?: boolean;
  pending?: boolean;
  gold?: boolean;
  finalPending?: boolean;
  tone?: BracketTone;
}) {
  if (pending) {
    return (
      <div
        className={cn(
          "torneo-bracket-slot flex items-center gap-2 rounded-xl px-2.5 py-2",
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
        "torneo-bracket-slot flex items-center gap-2 rounded-xl px-2.5 py-2",
        `torneo-bracket-slot--${tone}`,
        winner && "torneo-bracket-slot--winner",
        gold && "torneo-bracket-slot--champion",
      )}
    >
      <div
        className={cn(
          "relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2",
          `torneo-bracket-avatar--${tone}`,
        )}
      >
        <CreatorImage
          src={p.photo}
          alt={p.name}
          className="rounded-full object-cover"
          sizes="28px"
          fallback={<CreatorIcon name={p.name} icon={p.icon} size={14} />}
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
    </div>
  );
}
