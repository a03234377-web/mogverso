import { redirect } from "next/navigation";
import { DEFAULT_LOOKSMAX_PATH } from "@/features/app/routes";

export default function HomePage() {
  redirect(DEFAULT_LOOKSMAX_PATH);
}
