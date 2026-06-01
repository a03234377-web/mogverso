import { AuraRoute } from "@/features/aura/views/AuraRoute";
import { auraMetadata } from "@/lib/seo/pages";

export const metadata = auraMetadata;

export default function AuraPageRoute() {
  return <AuraRoute />;
}
