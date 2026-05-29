import { readFile } from "fs/promises";
import path from "path";
import { LooksMaxApp } from "@/components/LooksMaxApp";

async function loadLegacyBodyHtml(): Promise<string> {
  const filePath = path.join(process.cwd(), "public/legacy-body.html");
  return readFile(filePath, "utf-8");
}

export default async function HomePage() {
  const legacyHtml = await loadLegacyBodyHtml();
  return <LooksMaxApp legacyHtml={legacyHtml} />;
}
