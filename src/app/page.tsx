import { redirect } from "next/navigation";
import { DEFAULT_LOOKSMAX_PATH } from "@/features/app/routes";

export { generateHomeRedirectMetadata as generateMetadata } from "@/lib/seo/pages";

export default function HomePage() {
  redirect(DEFAULT_LOOKSMAX_PATH);
}
