import { NoticiasPage } from "@/features/noticias/pages/NoticiasPage";

export { generateNoticiasMetadata as generateMetadata } from "@/lib/seo/pages";

export default function NoticiasPageRoute() {
  return <NoticiasPage />;
}
