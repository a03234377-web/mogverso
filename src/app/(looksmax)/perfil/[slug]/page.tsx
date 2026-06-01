import type { Metadata, ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";
import { profilePath } from "@/features/app/routes";
import { ProfileRoute } from "@/features/rankings/views/ProfileRoute";
import { RANKERS } from "@/features/rankings/data/rankers";
import {
  findRankerByLegacyIndex,
  rankerProfileParam,
  resolveRankerFromProfileSlug,
} from "@/features/rankings/lib/profile-slug";
import { ProfilePersonJsonLd } from "@/lib/seo/json-ld";
import {
  buildProfileGenerateMetadata,
  generateProfileNotFoundMetadata,
} from "@/lib/seo/pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RANKERS.map((r) => ({ slug: rankerProfileParam(r.name) }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const ranker = resolveRankerFromProfileSlug(slug);
  if (!ranker) {
    return generateProfileNotFoundMetadata({}, parent);
  }
  return buildProfileGenerateMetadata(ranker)({}, parent);
}

export default async function ProfilePageRoute({ params }: PageProps) {
  const { slug } = await params;

  const legacy = findRankerByLegacyIndex(slug);
  if (legacy) {
    redirect(profilePath(legacy.name));
  }

  const ranker = resolveRankerFromProfileSlug(slug);
  if (!ranker) {
    notFound();
  }

  return (
    <>
      <ProfilePersonJsonLd
        name={ranker.name}
        title={ranker.title}
        description={ranker.bio}
      />
      <ProfileRoute ranker={ranker} />
    </>
  );
}
