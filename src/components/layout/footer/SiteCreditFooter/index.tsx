import Link from "next/link";
import { SITE_CREDIT } from "@/lib/site-credit";
import { cn } from "@/lib/cn";

const linkBase = cn(
  "inline-flex items-center justify-center rounded-lg border px-3.5 py-2",
  "text-sm font-bold no-underline lm-focus-ring transition-all duration-200",
);

export function SiteCreditFooter() {
  return (
    <footer
      className={cn(
        "relative z-[2] mt-auto border-t border-lm-border",
        "bg-[linear-gradient(180deg,transparent,rgba(7,9,15,0.85))]",
        "px-4 py-8 text-center max-md:px-3 max-md:py-6",
      )}
      aria-label="Créditos del sitio"
    >
      <div
        className="pointer-events-none mx-auto mb-5 h-px max-w-[240px] bg-[linear-gradient(90deg,transparent,rgba(232,184,75,0.35),transparent)]"
        aria-hidden
      />

      <p className="text-sm leading-relaxed font-semibold text-lm-text2">
        Sitio desarrollado por{" "}
        <span className="text-lm-text">{SITE_CREDIT.displayName}</span>
        <span className="text-lm-gold"> @{SITE_CREDIT.name}</span>
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-lm-text2/90">
        Conoce mi trabajo, escríbeme o revisa el código en GitHub.
      </p>

      <div
        className={cn(
          "mx-auto mt-4 flex max-w-lg flex-wrap items-center justify-center gap-2.5",
        )}
      >
        <Link
          href={SITE_CREDIT.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            linkBase,
            "border-lm-gold/45 bg-[rgba(232,184,75,0.12)] text-lm-gold",
            "hover:border-lm-gold/70 hover:bg-[rgba(232,184,75,0.2)]",
          )}
        >
          Portafolio
        </Link>
        <a
          href={`mailto:${SITE_CREDIT.email}`}
          className={cn(
            linkBase,
            "border-lm-border2 bg-lm-card text-lm-text",
            "hover:border-lm-border2 hover:bg-lm-card2",
          )}
        >
          {SITE_CREDIT.email}
        </a>
        <Link
          href={SITE_CREDIT.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            linkBase,
            "border-transparent bg-transparent px-2 py-1.5 text-lm-text2",
            "hover:text-lm-gold",
          )}
          aria-label="Perfil de GitHub de FraVelz"
        >
          GitHub
        </Link>
      </div>

      <p className="mt-5 text-xs text-lm-text2/75">LooksMax España · Mogverso</p>
    </footer>
  );
}
