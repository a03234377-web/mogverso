#!/usr/bin/env node
import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const imgDir = join(root, "public", "img");

const files = [
  "kappah.png",
  "kappahsub.png",
  "rubenmaxxing.jpg",
  "SergiCabrer.jpeg",
  "josenogales.jpeg",
  "titochape.jpeg",
  "aaronjaureguii.jpg",
  "alejandroale.png",
  "jordiwild.jpg",
  "peldanyos.jpg",
  "ibaillanos.jpg",
  "chiquiibai.jpg",
  "peereira7.jpg",
  "franbeuve.jpeg",
  "febron.jpeg",
  "elcalvo.jpg",
  "didac.png",
  "javichu.jpeg",
  "ismael.jpeg",
  "alvaro.png",
  "hectroll.png",
  "giva.jpeg",
  "nilojeda.png",
];

const missing = [];
for (const file of files) {
  try {
    await access(join(imgDir, file));
  } catch {
    missing.push(file);
  }
}

if (missing.length === 0) {
  console.log(`OK: ${files.length} imágenes en public/img/`);
  process.exit(0);
}

console.error(`Faltan ${missing.length} archivo(s) en public/img/:\n`);
for (const f of missing) console.error(`  - ${f}`);
console.error("\nCopia las fotos desde la web original (mismos nombres, respeta mayúsculas en SergiCabrer.jpeg).");
process.exit(1);
