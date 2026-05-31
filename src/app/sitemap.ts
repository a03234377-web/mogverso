import type { MetadataRoute } from "next";
import { LOOKSMAX_PATHS, profilePath } from "@/features/app/routes";
import { RANKERS } from "@/features/rankings/data/rankers";
import { getSiteUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const sections = Object.values(LOOKSMAX_PATHS).map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === LOOKSMAX_PATHS.rankings ? 1 : 0.8,
  }));

  const profiles = RANKERS.map((ranker) => ({
    url: `${base}${profilePath(ranker.name)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...sections,
    {
      url: `${base}/unirse`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...profiles,
  ];
}
