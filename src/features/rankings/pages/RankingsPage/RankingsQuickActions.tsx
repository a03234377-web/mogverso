"use client";

import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import { cn } from "@/lib/cn";
import { QuickActionRow } from "./RankingQuickActionButton";

export function RankingsQuickActions() {
  const { navigate } = useLooksMaxNavigate();

  return (
    <div
      className={cn(
        "mx-auto mt-7 mb-10 flex flex-wrap items-start justify-center gap-5 px-5",
        "max-md:mt-3 max-md:flex-col max-md:gap-3 max-md:px-4",
      )}
    >
      <QuickActionRow
        variant="vote"
        caption="Elige a tu looksmaxer favorito para que suba en el ranking"
        onClick={() => navigate("rankvote")}
      />
      <QuickActionRow
        variant="torneo"
        caption="¡El torneo ha comenzado: vota los partidos!"
        onClick={() => navigate("torneo")}
      />
    </div>
  );
}
