import { RankingsRoute } from "@/features/rankings/views/RankingsRoute";
import { RankingItemListJsonLd } from "@/lib/seo/json-ld";

export { generateRankingsMetadata as generateMetadata } from "@/lib/seo/pages";

export default function RankingsPageRoute() {
  return (
    <>
      <RankingItemListJsonLd />
      <RankingsRoute />
    </>
  );
}
