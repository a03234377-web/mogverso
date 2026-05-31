import { RankVotePage } from "@/features/rankvote/pages/RankVotePage";
import { rankvoteMetadata } from "@/lib/seo/pages";

export const metadata = rankvoteMetadata;

export default function VotarRankPageRoute() {
  return <RankVotePage />;
}
