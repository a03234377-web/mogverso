"use client";

import { ProfileAvatar } from "@/features/shared/components/Avatar";
import { Icon } from "@/components/icons";
import { ActivePage } from "@/features/shared/components/ui/ActivePage";
import { RANKERS } from "@/features/rankings/data/rankers";
import { useLooksMaxNavigate } from "@/features/app/shell/LooksMaxShell";
import { cn } from "@/lib/cn";

type ProfilePageProps = {
  profileIndex: number;
  rankPosition: number;
};

const tagStyles: Record<string, string> = {
  "ptag-chad":
    "text-[#ffd166] border-[rgba(255,209,102,0.4)] bg-[rgba(255,209,102,0.08)]",
  "ptag-appeal":
    "text-[#c586c0] border-[rgba(197,134,192,0.4)] bg-[rgba(197,134,192,0.08)]",
  "ptag-new": "text-lm-green2 border-[rgba(46,204,113,0.4)] bg-[rgba(46,204,113,0.08)]",
  "ptag-cortisol":
    "text-[#569cd6] border-[rgba(86,156,214,0.4)] bg-[rgba(86,156,214,0.08)]",
  "ptag-veteran":
    "text-lm-gold border-[rgba(232,184,75,0.4)] bg-[rgba(232,184,75,0.08)]",
  "ptag-risers":
    "text-[#4ec9b0] border-[rgba(78,201,176,0.4)] bg-[rgba(78,201,176,0.08)]",
  "ptag-score": "text-black bg-lm-gold border-lm-gold font-black",
  "ptag-creator":
    "text-lm-orange border-[rgba(249,115,22,0.4)] bg-[rgba(249,115,22,0.08)]",
  "ptag-humor":
    "text-[#22d3ee] border-[rgba(34,211,238,0.4)] bg-[rgba(34,211,238,0.08)]",
};

export function ProfilePage({ profileIndex, rankPosition }: ProfilePageProps) {
  const { backToRanking } = useLooksMaxNavigate();

  const r = RANKERS[profileIndex];
  if (!r) return null;

  const rank = rankPosition + 1;

  return (
    <ActivePage id="page-profile" active>
      <button
        type="button"
        className="mt-6 ml-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-lm-border bg-lm-card px-3.5 py-2 font-sans text-base font-bold tracking-[0.8px] text-lm-text2 lm-focus-ring transition-all duration-200 hover:-translate-x-1 hover:border-lm-border2 hover:text-lm-text max-md:ml-4"
        onClick={backToRanking}
      >
        ← Volver al Ranking
      </button>
      <div className="mx-auto mt-4 flex max-w-[1000px] items-start gap-6 px-5 max-md:flex-col max-md:items-center max-md:gap-4 max-md:px-4 max-md:text-center">
        <div className="relative shrink-0">
          <ProfileAvatar name={r.name} photoBg={r.photoBg} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-lm-bg bg-[linear-gradient(135deg,var(--color-lm-gold),var(--color-lm-gold3))] px-2.5 py-0.5 font-display text-base tracking-[1.5px] whitespace-nowrap text-black">
            #{rank}
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-0.5 flex flex-wrap items-center gap-2.5 max-md:justify-center">
            <div className="font-display text-[clamp(1.5rem,4vw,3rem)] tracking-[2px] text-lm-text max-md:text-[clamp(1.4rem,5vw,2.2rem)]">
              {r.name}
            </div>
            <div className="flex items-center gap-0.5 rounded-full border border-lm-border bg-[rgba(150,150,150,0.1)] px-2.5 py-0.5 text-base font-extrabold text-lm-text2 max-md:text-sm">
              — Ranking dinámico
            </div>
          </div>
          <div className="mb-3 text-base font-semibold text-lm-text2">
            {r.title} · {r.sub}
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5 max-md:justify-center">
            {r.tagNames.map((t, idx) => {
              const cls =
                idx === r.tagNames.length - 1
                  ? "ptag-score"
                  : r.tags[idx] || "ptag-appeal";
              return (
                <span
                  key={t}
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-sm font-bold tracking-[0.8px]",
                    tagStyles[cls],
                  )}
                >
                  {t}
                </span>
              );
            })}
          </div>
          <div className="flex gap-3 max-md:justify-center">
            <div className="text-center">
              <div className="font-display text-[1.4rem] text-lm-gold">{r.score}</div>
              <div className="text-sm font-bold tracking-wider text-lm-text2 uppercase">
                Score
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1000px] px-5 pt-5 pb-12 max-md:px-4 max-md:pb-20">
        <div className="flex flex-col gap-4">
          <div className="rounded-[14px] border border-lm-border bg-lm-card p-5 transition-all duration-300 hover:border-lm-border2">
            <div className="mb-3 flex items-center gap-1.5 text-base font-extrabold tracking-[0.8px] text-lm-text">
              <Icon name="clipboard-list" size={16} className="text-lm-gold" />{" "}
              Biografía
            </div>
            <div className="font-serif text-base leading-relaxed text-lm-text2">
              {r.bio}
            </div>
          </div>
          <div className="rounded-[14px] border border-lm-border bg-lm-card p-5 transition-all duration-300 hover:border-lm-border2">
            <div className="mb-3 flex items-center gap-1.5 text-base font-extrabold tracking-[0.8px] text-lm-text">
              <Icon name="trending-up" size={16} className="text-lm-green2" /> Último
              Movimiento
            </div>
            <div className="flex items-start gap-3">
              <Icon
                name={r.movIcon}
                size={18}
                className="mt-0.5 shrink-0 text-lm-gold"
              />
              <div className="font-serif text-base leading-relaxed text-lm-text2">
                {r.movement}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ActivePage>
  );
}
