import type { Metadata, ResolvingMetadata } from "next";
import { DEFAULT_DESCRIPTION, getSiteUrl, SITE_NAME } from "@/lib/seo/site";

type PageMetaInput = {
  title: string;
  description?: string;
  /** Ruta con barra inicial, p. ej. `/rankings` */
  path: string;
  noIndex?: boolean;
  keywords?: string[];
};

function pageCanonical(path: string): string {
  const base = getSiteUrl();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}

function pageFullTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
}

/** Imagen OG heredada del layout (`src/app/opengraph-image.png` + `.alt.txt`). */
function ogImagesFromParent(parent: Metadata) {
  return parent.openGraph?.images;
}

function ogImageUrl(img: unknown): string | undefined {
  if (typeof img === "string") return img;
  if (img instanceof URL) return img.href;
  if (img && typeof img === "object" && "url" in img) {
    const url = (img as { url: string | URL }).url;
    return url instanceof URL ? url.href : String(url);
  }
  return undefined;
}

function twitterImagesFromOg(
  images: NonNullable<Metadata["openGraph"]>["images"],
): NonNullable<Metadata["twitter"]>["images"] {
  const list = (Array.isArray(images) ? images : [images]).filter(
    (img): img is NonNullable<typeof img> => img != null,
  );
  const urls = list.map(ogImageUrl).filter((url): url is string => Boolean(url));
  if (urls.length === 0) return undefined;
  return urls.length === 1 ? urls[0] : urls;
}

/** Campos de metadatos por ruta (sin imagen OG: la define el App Router en `app/`). */
export function resolvePageMetadata(input: PageMetaInput, parent: Metadata): Metadata {
  const description = input.description ?? DEFAULT_DESCRIPTION;
  const canonical = pageCanonical(input.path);
  const fullTitle = pageFullTitle(input.title);
  const images = ogImagesFromParent(parent);

  return {
    title: input.title,
    description,
    keywords: input.keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(images ? { images: twitterImagesFromOg(images) } : {}),
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Metadatos por ruta con `generateMetadata`: título/OG/Twitter por página
 * y imagen compartida vía convención de archivos (`app/opengraph-image.png`).
 */
export function buildPageGenerateMetadata(input: PageMetaInput) {
  return async (_props: unknown, parent: ResolvingMetadata): Promise<Metadata> =>
    resolvePageMetadata(input, (await parent) as Metadata);
}

export function rootLayoutMetadata(): Metadata {
  const url = getSiteUrl();
  return {
    metadataBase: new URL(url),
    title: {
      default: `${SITE_NAME} — Ranking Oficial`,
      template: `%s — ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: { canonical: pageCanonical("/rankings") },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Ranking Oficial`,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — Ranking Oficial`,
      description: DEFAULT_DESCRIPTION,
    },
    robots: { index: true, follow: true },
  };
}
