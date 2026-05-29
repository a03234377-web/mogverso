#!/usr/bin/env node
import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CREATOR_IMAGE_FILES } from "./image-manifest.mjs";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const imgDir = join(root, "src", "assets", "creators");

const missing = [];
for (const file of CREATOR_IMAGE_FILES) {
  try {
    await access(join(imgDir, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length === 0) {
  console.log(`OK: ${CREATOR_IMAGE_FILES.length} imágenes en src/assets/creators/`);
  process.exit(0);
}

console.error(`Faltan ${missing.length} archivo(s) en src/assets/creators/:\n`);
for (const f of missing) console.error(`  - ${f}`);
console.error(
  "\nDescarga automática: npm run download:images -- --base-url https://tu-sitio-original.com",
);
console.error("Respeta mayúsculas (p. ej. SergiCabrer.webp).");
process.exit(1);
