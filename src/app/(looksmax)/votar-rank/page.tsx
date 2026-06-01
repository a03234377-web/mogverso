import { RankVotePage } from "@/features/rankvote/pages/RankVotePage";

export { generateRankvoteMetadata as generateMetadata } from "@/lib/seo/pages";

export default function VotarRankPageRoute() {
  return <RankVotePage />;
}
