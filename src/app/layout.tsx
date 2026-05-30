import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: false,
});

const syne = Syne({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "LooksMax España — El Ranking Oficial",
  description:
    "Ranking oficial de looksmaxing en España. Votaciones en tiempo real, torneo y comunidad.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mogverso.vercel.app",
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${syne.className} min-h-screen bg-lm-bg pb-[calc(var(--lm-bottom-nav-height)+env(safe-area-inset-bottom,0px))] text-base text-lm-text antialiased select-text`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
