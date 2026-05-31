import type { Metadata } from "next";
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

/** Metadatos por ruta con título, OG, Twitter y canonical. */
export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  keywords,
}: PageMetaInput): Metadata {
  const canonical = pageCanonical(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: canonical,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
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
