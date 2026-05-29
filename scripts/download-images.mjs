#!/usr/bin/env node
/**
 * Descarga imágenes de creadores a src/assets/creators/.
 *
 * Fuentes (por defecto):
 *   - git: public/legacy-body.html y public/legacy/app-runtime.js (commit antes del refactor)
 *   - lista canónica en scripts/image-manifest.mjs
 *
 * El HTML legacy solo usa rutas relativas (/img/foo.png), no URLs https sueltas.
 * Indica el sitio donde estaban alojadas con --base-url o DOWNLOAD_IMAGES_BASE_URL.
 *
 * Uso:
 *   node scripts/download-images.mjs --base-url https://tu-sitio-original.com
 *   node scripts/download-images.mjs --html ruta/a/index.html --base-url https://...
 *   npm run download:images -- --base-url https://...
 */
import { execSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import {
  CREATOR_IMAGE_FILES,
  extractImageRefs,
  pathToFilename,
} from "./image-manifest.mjs";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const imgDir = join(root, "src", "assets", "creators");

function parseArgs(argv) {
  const opts = {
    baseUrls: [],
    html: null,
    fromGit: true,
    dryRun: false,
    onlyCanonical: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--no-git") {
      opts.fromGit = false;
    } else if (arg === "--only-canonical") {
      opts.onlyCanonical = true;
    } else if (arg === "--base-url" && argv[i + 1]) {
      opts.baseUrls.push(argv[++i].replace(/\/$/, ""));
    } else if (arg === "--html" && argv[i + 1]) {
      opts.html = argv[++i];
    }
  }

  return opts;
}

async function loadEnvFile(filename) {
  const path = join(root, filename);
  try {
    const text = await readFile(path, "utf8");
    const env = {};
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
    return env;
  } catch {
    return {};
  }
}

function readGitLegacy(pathInRepo) {
  try {
    return execSync(`git show 6fcb053^:"${pathInRepo}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    try {
      return execSync(`git show 0f79e00:"${pathInRepo}"`, {
        cwd: root,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch {
      return "";
    }
  }
}

function defaultBaseUrls(env) {
  const urls = [];
  const fromEnv =
    process.env.DOWNLOAD_IMAGES_BASE_URL ||
    env.DOWNLOAD_IMAGES_BASE_URL ||
    env.NEXT_PUBLIC_CREATOR_IMAGES_BASE ||
    env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) urls.push(fromEnv.replace(/\/$/, ""));

  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) {
    urls.push(`https://${projectId}.web.app`);
    urls.push(`https://${projectId}.firebaseapp.com`);
  }

  return [...new Set(urls)];
}

function buildDownloadPlan(sources, baseUrls) {
  /** @type {Map<string, { filename: string, urls: string[] }>} */
  const plan = new Map();

  const addFile = (filename, url) => {
    if (!filename) return;
    const entry = plan.get(filename) ?? { filename, urls: [] };
    if (!entry.urls.includes(url)) entry.urls.push(url);
    plan.set(filename, entry);
  };

  for (const file of CREATOR_IMAGE_FILES) {
    for (const base of baseUrls) {
      addFile(file, `${base}/img/${file}`);
    }
  }

  for (const url of sources.absolute) {
    const filename = pathToFilename(new URL(url).pathname);
    if (filename) addFile(filename, url);
  }

  for (const path of sources.paths) {
    const filename = pathToFilename(path);
    if (!filename) continue;
    for (const base of baseUrls) {
      addFile(filename, `${base}${path.startsWith("/") ? path : `/${path}`}`);
    }
  }

  return plan;
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  await pipeline(res.body, createWriteStream(dest));
  const { size } = await stat(dest);
  if (size < 200) {
    throw new Error(`archivo demasiado pequeño (${size} bytes), posible 404/HTML`);
  }
}

function printHelp() {
  console.log(`download-images — guarda fotos en src/assets/creators/

Opciones:
  --base-url <url>   Origen del sitio original (sin barra final). Repetible.
  --html <archivo>   HTML adicional para extraer src (p. ej. index.html antiguo)
  --no-git           No leer legacy-body.html / app-runtime.js del historial git
  --only-canonical   Solo la lista de 23 archivos (ignora refs extraídas)
  --dry-run          Mostrar URLs sin descargar

Variables de entorno (.env.local o shell):
  DOWNLOAD_IMAGES_BASE_URL
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_FIREBASE_PROJECT_ID  → prueba también *.web.app y *.firebaseapp.com

Ejemplo:
  npm run download:images -- --base-url https://mi-looksmax.web.app
`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const env = {
    ...(await loadEnvFile(".env.local")),
    ...(await loadEnvFile(".env")),
  };
  const baseUrls = [...opts.baseUrls, ...defaultBaseUrls(env)].map((u) =>
    u.replace(/\/$/, ""),
  );

  if (baseUrls.length === 0) {
    console.error(
      "Error: indica al menos un origen con --base-url o DOWNLOAD_IMAGES_BASE_URL en .env.local\n",
    );
    printHelp();
    process.exit(1);
  }

  let combinedText = "";
  const gitNotes = [];

  if (opts.fromGit) {
    const body = readGitLegacy("public/legacy-body.html");
    const runtime = readGitLegacy("public/legacy/app-runtime.js");
    if (body) {
      combinedText += body;
      gitNotes.push("legacy-body.html (git)");
    }
    if (runtime) {
      combinedText += runtime;
      gitNotes.push("legacy/app-runtime.js (git)");
    }
  }

  if (opts.html) {
    const htmlPath = opts.html.startsWith("/")
      ? opts.html
      : join(process.cwd(), opts.html);
    combinedText += await readFile(htmlPath, "utf8");
    gitNotes.push(opts.html);
  }

  const extracted = extractImageRefs(combinedText);
  const sources = opts.onlyCanonical ? { paths: [], absolute: [] } : extracted;

  console.log(
    "Fuentes:",
    gitNotes.length ? gitNotes.join(", ") : "(solo lista canónica)",
  );
  console.log(
    "Refs extraídas:",
    `${sources.paths.length} rutas /img, ${sources.absolute.length} URLs absolutas`,
  );
  if (sources.absolute.length) {
    console.log("URLs absolutas encontradas:");
    for (const u of sources.absolute) console.log(`  ${u}`);
  } else if (combinedText && !sources.paths.length) {
    console.log(
      "(El HTML/JS legacy no contenía URLs https de imágenes, solo rutas /img/…)\n",
    );
  }

  console.log("Orígenes a probar:", baseUrls.join(", "), "\n");

  const plan = buildDownloadPlan(sources, baseUrls);
  await mkdir(imgDir, { recursive: true });

  let ok = 0;
  let fail = 0;
  const failed = [];

  for (const file of CREATOR_IMAGE_FILES) {
    const entry = plan.get(file);
    if (!entry) {
      fail++;
      failed.push({ file, reason: "sin URL en el plan" });
      continue;
    }

    if (opts.dryRun) {
      console.log(`${file}:`);
      for (const u of entry.urls) console.log(`  ${u}`);
      continue;
    }

    const dest = join(imgDir, file);
    let saved = false;
    for (const url of entry.urls) {
      try {
        process.stdout.write(`↓ ${file} ← ${url} … `);
        await downloadFile(url, dest);
        console.log("OK");
        ok++;
        saved = true;
        break;
      } catch (e) {
        console.log(`falló (${e.message})`);
      }
    }
    if (!saved) {
      fail++;
      failed.push({ file, reason: "ninguna URL respondió con imagen válida" });
    }
  }

  if (opts.dryRun) {
    console.log("\n(dry-run: no se descargó nada)");
    process.exit(0);
  }

  console.log(`\nResumen: ${ok} descargadas, ${fail} fallidas`);
  if (failed.length) {
    console.error("\nNo se pudieron obtener:");
    for (const f of failed) console.error(`  - ${f.file}: ${f.reason}`);
    console.error(
      "\nComprueba --base-url (dominio donde existía la carpeta img/) o copia los archivos a mano.",
    );
    process.exit(1);
  }

  console.log(`\nListo. Ejecuta: npm run check:images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
