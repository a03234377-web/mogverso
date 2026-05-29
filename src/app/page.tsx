import { redirect } from "next/navigation";
import { DEFAULT_LOOKSMAX_PATH } from "@/features/looksmax/routes";

export default function HomePage() {
  redirect(DEFAULT_LOOKSMAX_PATH);
}
