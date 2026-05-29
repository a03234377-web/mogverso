"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SkipLink } from "@/components/a11y/SkipLink";
import { DiscordModal } from "@/features/looksmax/components/DiscordModal";
import { FirebaseLoader } from "@/features/looksmax/components/FirebaseLoader";
import { GlobalAnnouncements } from "@/features/looksmax/components/GlobalAnnouncements";
import { BottomNav, DesktopNav } from "@/features/looksmax/components/Navigation";
import { Particles } from "@/features/looksmax/components/Particles";
import { Ticker } from "@/features/looksmax/components/Ticker";
import { BackgroundEffects } from "@/features/looksmax/components/ui/BackgroundEffects";
import { useFirebase } from "@/features/looksmax/context/FirebaseProvider";
import {
  DEFAULT_LOOKSMAX_PATH,
  isNavPage,
  pageIdFromPathname,
  pathForPage,
} from "@/features/looksmax/routes";
import type { PageId } from "@/features/looksmax/types";
import { useSecurityGuard } from "@/features/looksmax/hooks/useSecurityGuard";
import { isEscape } from "@/lib/a11y/keyboard";

export function LooksMaxShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { page } = pageIdFromPathname(pathname);
  const { announcements } = useFirebase();
  const [moreOpen, setMoreOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);

  useSecurityGuard();

  const mainRef = useRef<HTMLElement>(null);
  const navPage: PageId = isNavPage(page) ? page : "rankings";

  const focusMain = useCallback(() => {
    requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const navigate = useCallback(
    (id: PageId) => {
      const href = pathForPage(id);
      if (href !== pathname) {
        router.push(href);
      }
      setMoreOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      focusMain();
    },
    [focusMain, pathname, router],
  );

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
      <DesktopNav
        page={navPage}
        onNavigate={navigate}
        onOpenDiscord={() => setDiscordOpen(true)}
      />
      <BottomNav
        page={navPage}
        onNavigate={navigate}
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
