import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { LooksMaxApp } from "@/components/LooksMaxApp";

export const metadata: Metadata = {
  title: "LooksMax España — El Ranking Oficial",
  description:
    "Ranking oficial de looksmaxing en España. Votaciones en tiempo real, torneo y comunidad.",
};

async function loadLegacyBodyHtml(): Promise<string> {
  const filePath = path.join(process.cwd(), "public/legacy-body.html");
  return readFile(filePath, "utf-8");
}

export default async function HomePage() {
  const legacyHtml = await loadLegacyBodyHtml();
  return <LooksMaxApp legacyHtml={legacyHtml} />;
}
