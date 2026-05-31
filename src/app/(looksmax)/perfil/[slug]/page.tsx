import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { profilePath } from "@/features/app/routes";
import { ProfileRoute } from "@/features/rankings/views/ProfileRoute";
import { RANKERS } from "@/features/rankings/data/rankers";
import {
  findRankerByLegacyIndex,
  rankerProfileSlug,
  resolveRankerFromProfileSlug,
} from "@/features/rankings/lib/profile-slug";
import { ProfilePersonJsonLd } from "@/lib/seo/json-ld";
import { buildProfileMetadata, profileNotFoundMetadata } from "@/lib/seo/pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RANKERS.map((r) => ({ slug: rankerProfileSlug(r.name) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ranker = resolveRankerFromProfileSlug(slug);
  if (!ranker) {
    return profileNotFoundMetadata;
  }
  return buildProfileMetadata(ranker);
}

export default async function ProfilePageRoute({ params }: PageProps) {
  const { slug } = await params;

  const legacy = findRankerByLegacyIndex(slug);
  if (legacy) {
    redirect(profilePath(legacy.name));
  }

  const ranker = resolveRankerFromProfileSlug(slug);

  return (
    <>
      {ranker && (
        <ProfilePersonJsonLd
          name={ranker.name}
          title={ranker.title}
          description={ranker.bio}
        />
      )}
      <ProfileRoute />
    </>
  );
}
