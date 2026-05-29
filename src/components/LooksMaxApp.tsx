"use client";

import { useCallback, useEffect, useState } from "react";
import Script from "next/script";
import { LooksMaxErrorBoundary } from "@/components/LooksMaxErrorBoundary";
import { DiscordModal } from "@/components/looksmax/DiscordModal";
import { FirebaseLoader } from "@/components/looksmax/FirebaseLoader";
import { GlobalAnnouncements } from "@/components/looksmax/GlobalAnnouncements";
import { BottomNav, DesktopNav } from "@/components/looksmax/Navigation";
import { Particles } from "@/components/looksmax/Particles";
import { Ticker } from "@/components/looksmax/Ticker";
import { BackgroundEffects } from "@/components/looksmax/ui/BackgroundEffects";
import { ConsejoPage, LexicoPage, NoticiasPage } from "@/components/looksmax/pages/StaticPages";
import { ProfilePage } from "@/components/looksmax/pages/ProfilePage";
import { RankVotePage } from "@/components/looksmax/pages/RankVotePage";
import { RankingsPage } from "@/components/looksmax/pages/RankingsPage";
import { TorneoPage } from "@/components/looksmax/pages/TorneoPage";
import type { PageId } from "@/components/looksmax/types";
import { FirebaseProvider, useFirebase } from "@/contexts/FirebaseProvider";
import { useRankingData } from "@/hooks/useRankingData";
import { useSecurityGuard } from "@/hooks/useSecurityGuard";

function LooksMaxAppInner() {
  const { announcements } = useFirebase();
  const { entries, upMovers, downMovers, rankVoteEnd } = useRankingData();
  const [page, setPage] = useState<PageId>("rankings");
  const [moreOpen, setMoreOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);
  const [profileIndex, setProfileIndex] = useState<number | null>(null);
  const [profileRank, setProfileRank] = useState(0);

  useSecurityGuard();

  const navigate = useCallback((id: PageId) => {
    setPage(id);
    setProfileIndex(null);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openProfile = useCallback((originalIndex: number, rankPos: number) => {
    setProfileIndex(originalIndex);
    setProfileRank(rankPos);
    setPage("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const backToRanking = useCallback(() => {
    setProfileIndex(null);
    setPage("rankings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDiscordOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <div id="looksmax-root" className="relative">
      <BackgroundEffects />
      <Particles />
      <FirebaseLoader />
      <Ticker />
      <GlobalAnnouncements items={announcements} />
      <DesktopNav
        page={page === "profile" ? "rankings" : page}
        onNavigate={navigate}
        onOpenDiscord={() => setDiscordOpen(true)}
      />
      <BottomNav
        page={page === "profile" ? "rankings" : page}
        onNavigate={navigate}
        onOpenDiscord={() => setDiscordOpen(true)}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((o) => !o)}
      />

      {page === "rankings" && (
        <RankingsPage
          page="rankings"
          entries={entries}
          upMovers={upMovers}
          downMovers={downMovers}
          rankVoteEnd={rankVoteEnd}
          onNavigate={navigate}
          onOpenDiscord={() => setDiscordOpen(true)}
          onOpenProfile={openProfile}
          adsenseClient={adsenseClient}
        />
      )}
      <RankVotePage active={page === "rankvote"} />
      <TorneoPage active={page === "torneo"} />
      <NoticiasPage active={page === "noticias"} />
      <ConsejoPage active={page === "consejo"} />
      <LexicoPage active={page === "lexico"} />
      <ProfilePage
        active={page === "profile"}
        profileIndex={profileIndex}
        rankPosition={profileRank}
        onBack={backToRanking}
      />

      <DiscordModal open={discordOpen} onClose={() => setDiscordOpen(false)} />
    </div>
  );
}

export function LooksMaxApp() {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      {adsenseClient && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {recaptchaKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaKey}`}
          strategy="afterInteractive"
        />
      )}
      <LooksMaxErrorBoundary>
        <FirebaseProvider>
          <LooksMaxAppInner />
        </FirebaseProvider>
      </LooksMaxErrorBoundary>
    </>
  );
}
