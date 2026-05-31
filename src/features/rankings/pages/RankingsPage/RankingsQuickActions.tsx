"use client";

import { Icon } from "@/components/icons";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import { cn } from "@/lib/cn";

export function RankingsQuickActions() {
  const { navigate } = useLooksMaxNavigate();

  return (
    <div
      className={cn(
        "mx-auto mt-7 mb-10 flex flex-wrap items-start justify-center gap-5 px-5",
        "max-md:mt-3 max-md:flex-col max-md:gap-3 max-md:px-4",
      )}
    >
      <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
        <button
          type="button"
          className={cn(
            "min-h-[58px] w-full cursor-pointer rounded-[14px] border-none px-8 py-3",
            "bg-[linear-gradient(135deg,var(--color-lm-green2),var(--color-lm-gold))]",
            "font-sans text-lg font-bold text-black shadow-[0_0_24px_rgba(46,204,113,0.35)]",
            "lm-focus-ring-on-gold transition-all duration-250 hover:scale-105",
            "max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4",
            "max-md:py-2.5 max-md:text-base",
          )}
          onClick={() => navigate("rankvote")}
        >
          <Icon name="vote" size={18} className="inline text-black" /> VOTAR RANKING
        </button>
        <p
          className={cn(
            "m-0 text-center text-base leading-snug font-semibold text-lm-text2",
            "max-md:flex-[1.3] max-md:text-left max-md:text-base",
          )}
        >
          Elige a tu looksmaxer favorito para que suba en el ranking
        </p>
      </div>
      <div className="flex w-[220px] flex-col items-center gap-2.5 max-md:w-full max-md:flex-row max-md:gap-3.5">
        <button
          type="button"
          className={cn(
            "min-h-[58px] w-full cursor-pointer rounded-[14px] border-none px-8 py-3",
            "bg-[linear-gradient(135deg,#ff6b35,var(--color-lm-gold))]",
            "font-sans text-lg font-bold text-black shadow-[0_0_24px_rgba(255,107,53,0.35)]",
            "lm-focus-ring-on-gold transition-all duration-250 hover:scale-105",
            "max-md:min-h-[50px] max-md:flex-1 max-md:rounded-xl max-md:px-4",
            "max-md:py-2.5 max-md:text-base",
          )}
          onClick={() => navigate("torneo")}
        >
          <Icon name="goal" size={18} className="inline text-black" /> TORNEO EN VIVO
        </button>
        <p
          className={cn(
            "m-0 text-center text-base leading-snug font-semibold text-lm-text2",
            "max-md:flex-[1.3] max-md:text-left max-md:text-base",
          )}
        >
          ¡El torneo ha comenzado — vota los partidos!
        </p>
      </div>
    </div>
  );
}
