import { redirect } from "next/navigation";
import { LOOKSMAX_PATHS } from "@/features/app/routes";

/** Ruta legacy: Consejos sustituido por Aura. */
export default function ConsejoRedirectPage() {
  redirect(LOOKSMAX_PATHS.aura);
}
