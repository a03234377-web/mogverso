import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Syne } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const syne = Syne({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
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
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${bebas.variable} ${syne.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
