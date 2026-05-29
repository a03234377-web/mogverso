/** Lista canónica (public/img/). Compartida por check-images y download-images. */
export const CREATOR_IMAGE_FILES = [
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

const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

/** Rutas /img/... y URLs http(s) en texto (HTML, JS). */
export function extractImageRefs(text) {
  const paths = new Set();
  const absolute = new Set();

  for (const m of text.matchAll(/https?:\/\/[^\s"'<>)\]]+/gi)) {
    const url = m[0].replace(/[),.;]+$/, "");
    if (IMG_EXT.test(url)) absolute.add(url);
  }

  for (const m of text.matchAll(/["'](\/img\/[^"'?#]+)["']/gi)) {
    paths.add(m[1]);
  }

  for (const m of text.matchAll(/["']img\/([^"'?#]+)["']/gi)) {
    paths.add(`/img/${m[1]}`);
  }

  return { paths: [...paths], absolute: [...absolute] };
}

export function pathToFilename(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const name = normalized.split("/").pop();
  if (!name || !IMG_EXT.test(name)) return null;
  return name;
}
