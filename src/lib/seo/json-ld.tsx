import { RANKERS } from "@/features/rankings/data/rankers";
import { LOOKSMAX_PATHS, profilePath } from "@/features/app/routes";
import { getSiteUrl, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const url = getSiteUrl();
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        description: SITE_TAGLINE,
        url,
        inLanguage: "es-ES",
      }}
    />
  );
}

/** Lista ordenada base (RANKERS) para crawlers; el orden en vivo viene de Firebase. */
export function RankingItemListJsonLd() {
  const url = getSiteUrl();
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${SITE_NAME} — Ranking completo`,
        description: "Ranking de creadores looksmaxer en España (orden de referencia).",
        url: `${url}${LOOKSMAX_PATHS.rankings}`,
        numberOfItems: RANKERS.length,
        itemListElement: RANKERS.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: r.name,
          url: `${url}${profilePath(r.name)}`,
        })),
      }}
    />
  );
}

export function ProfilePersonJsonLd({
  name,
  title,
  description,
  rank,
}: {
  name: string;
  title: string;
  description: string;
  rank?: number;
}) {
  const url = `${getSiteUrl()}${profilePath(name)}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: `${title}. ${description}`,
    url,
    jobTitle: "Creador looksmaxer",
    nationality: { "@type": "Country", name: "España" },
    memberOf: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
  if (rank != null) {
    data.additionalProperty = {
      "@type": "PropertyValue",
      name: "Posición en ranking",
      value: rank,
    };
  }
  return <JsonLdScript data={data} />;
}
