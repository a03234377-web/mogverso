import type { Viewport } from "next";
import { Bebas_Neue, Lora, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { cn } from "@/lib/cn";
import { WebSiteJsonLd } from "@/lib/seo/json-ld";
import { rootLayoutMetadata } from "@/lib/seo/metadata";
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

const lora = Lora({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

export const metadata = rootLayoutMetadata();

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
      className={cn(bebas.variable, syne.variable, lora.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          syne.className,
          "min-h-screen bg-lm-bg text-base text-lm-text antialiased select-text",
          "pb-[calc(var(--lm-bottom-nav-height)+env(safe-area-inset-bottom,0px))]",
        )}
      >
        <WebSiteJsonLd />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
