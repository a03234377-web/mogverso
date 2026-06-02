import { redirect } from "next/navigation";
import { LOOKSMAX_PATHS } from "@/features/app/routes";
import { buildPageGenerateMetadata } from "@/lib/seo/metadata";

export const generateMetadata = buildPageGenerateMetadata({
  title: "Aura LooksMax",
  description: "Redirección a la votación de aura del ranking LooksMax España.",
  path: LOOKSMAX_PATHS.aura,
  noIndex: true,
});

/** Ruta legacy: Consejos sustituido por Aura. */
export default function ConsejoRedirectPage() {
  redirect(LOOKSMAX_PATHS.aura);
}
