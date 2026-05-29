"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SkipLink } from "@/components/a11y/SkipLink";
import { DiscordModal } from "@/features/app/components/DiscordModal";
import { FirebaseLoader } from "@/features/app/components/FirebaseLoader";
import { GlobalAnnouncements } from "@/features/app/components/GlobalAnnouncements";
import { LooksMaxFooter, LooksMaxHeader } from "@/components/layout";
import { Particles } from "@/features/app/components/Particles";
import { Ticker } from "@/features/app/components/Ticker";
import { BackgroundEffects } from "@/features/app/components/BackgroundEffects";
import { useFirebase } from "@/features/app/context/FirebaseProvider";
import {
  DEFAULT_LOOKSMAX_PATH,
  isNavPage,
  pageIdFromPathname,
  pathForPage,
} from "@/features/app/routes";
import type { PageId } from "@/features/app/types";
import { useSecurityGuard } from "@/features/app/hooks/useSecurityGuard";
import { isEscape } from "@/lib/a11y/keyboard";

export function LooksMaxShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { page } = pageIdFromPathname(pathname);
  const { announcements } = useFirebase();
  const [moreOpen, setMoreOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);

  useSecurityGuard();

  const mainRef = useRef<HTMLElement>(null);
  const navPage: PageId = isNavPage(page) ? page : "rankings";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isEscape(e.key)) return;
      if (moreOpen) {
        setMoreOpen(false);
        e.preventDefault();
        return;
      }
      if (discordOpen) {
        setDiscordOpen(false);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen, discordOpen]);

  return (
    <div id="looksmax-root" className="relative overflow-x-clip">
      <SkipLink />
      <BackgroundEffects />
      <Particles />
      <FirebaseLoader />
      <Ticker />
      <GlobalAnnouncements items={announcements} />
      <LooksMaxHeader page={navPage} onOpenDiscord={() => setDiscordOpen(true)} />
      <LooksMaxFooter
        page={navPage}
        onOpenDiscord={() => setDiscordOpen(true)}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((o) => !o)}
      />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="outline-none"
        aria-label="Contenido principal"
      >
        {children}
      </main>

      <DiscordModal open={discordOpen} onClose={() => setDiscordOpen(false)} />
    </div>
  );
}

/** Navegación programática desde páginas del feature. */
export function useLooksMaxNavigate() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (id: PageId) => {
      const href = pathForPage(id);
      if (href !== pathname) router.push(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname, router],
  );

  const openProfile = useCallback(
    (originalIndex: number, rankPos: number) => {
      void rankPos;
      const href = pathForPage("profile", originalIndex);
      if (href !== pathname) router.push(href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname, router],
  );

  const backToRanking = useCallback(() => {
    if (pathname !== DEFAULT_LOOKSMAX_PATH) router.push(DEFAULT_LOOKSMAX_PATH);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname, router]);

  return { navigate, openProfile, backToRanking };
}
