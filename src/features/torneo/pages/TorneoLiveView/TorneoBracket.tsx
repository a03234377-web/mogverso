"use client";

import type { ReactNode } from "react";
import { CreatorImage } from "@/components/CreatorImage";
import { CreatorIcon, Icon } from "@/components/icons";
import { getPlayerByName } from "@/features/torneo/data/torneo-players";
import { OCTAVOS_IDS } from "@/lib/torneo-bracket";
import type { TorneoState } from "@/types/looksmax";
import { cn } from "@/lib/cn";

export function TorneoBracket({ state }: { state: TorneoState | null }) {
  if (!state)
    return <div className="flex gap-2 overflow-x-auto pb-3" id="torneoBracketGrid" />;

  const octavosWinners = state.octavosWinners ?? [];
  const cuartosWinners = state.cuartosWinners ?? [];
  const champion = state.champion ?? null;
  const fm = state.finalMatch;

  return (
    <div className="flex gap-2 overflow-x-auto pb-3" id="torneoBracketGrid">
      <BracketColumn title="Octavos">
        {OCTAVOS_IDS.flatMap((matchId) => {
          const oMatch = state.matches?.[matchId];
          if (!oMatch) {
            return [
              <BracketSlot key={`${matchId}-a`} tbd />,
              <BracketSlot key={`${matchId}-b`} tbd />,
            ];
          }
          return [oMatch.p1, oMatch.p2].map((pname) => (
            <BracketSlot
              key={`${matchId}-${pname}`}
              name={pname}
              winner={oMatch.resolved && oMatch.winner === pname}
            />
          ));
        })}
      </BracketColumn>

      <BracketColumn title="Cuartos">
        {(["cua_0", "cua_1", "cua_2", "cua_3"] as const).flatMap((matchId, i) => {
          const cMatch = state.cuartosMatches?.[matchId];
          if (!cMatch) {
            const w1 = octavosWinners[i * 2];
            const w2 = octavosWinners[i * 2 + 1];
            if (w1 && w2) {
              return [
                <BracketSlot key={`${matchId}-a`} name={w1} />,
                <BracketSlot key={`${matchId}-b`} name={w2} />,
              ];
            }
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
      </BracketColumn>

      <BracketColumn title="Semifinales">
        {[0, 1, 2, 3].map((i) => {
          const w = cuartosWinners[i] ?? null;
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
      </BracketColumn>

      <BracketColumn title="Final" goldTitle>
        {champion ? (
          <BracketSlot name={champion} winner gold />
        ) : state.semisWinners && state.semisWinners.length >= 2 ? (
          [state.semisWinners[0], state.semisWinners[1]].map((w) => (
            <BracketSlot key={w} name={w} winner={fm?.resolved && fm.winner === w} />
          ))
        ) : (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-[rgba(232,184,75,0.4)]",
              "bg-lm-card px-2 py-1.5 opacity-40",
            )}
          >
            <Icon name="crown" size={12} className="text-lm-gold" />
            <div className="max-w-[75px] truncate text-base font-bold text-lm-gold max-md:max-w-[90px]">
              Por decidir
            </div>
          </div>
        )}
      </BracketColumn>
    </div>
  );
}

function BracketColumn({
  title,
  goldTitle,
  children,
}: {
  title: string;
  goldTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-[110px] shrink-0 flex-col gap-1.5">
      <div
        className={cn(
          "mb-1 border-b border-lm-border py-1 text-center lm-type-label max-md:text-base",
          goldTitle ? "text-lm-gold" : "text-lm-text2",
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
        <div className="max-w-[75px] truncate text-base font-bold text-lm-text2 max-md:max-w-[90px]">
          TBD
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
      <div
        className={cn(
          "relative h-[22px] w-[22px] shrink-0 overflow-hidden rounded-full",
          "border border-lm-border bg-lm-bg3 text-base",
        )}
      >
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
          "max-w-[75px] truncate text-base font-bold text-lm-text max-md:max-w-[90px]",
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
