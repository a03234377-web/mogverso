import { notFound } from "next/navigation";
import { AdminTorneoPanel } from "@/features/torneo/pages/AdminTorneoPanel";
import { isTorneoDevToolsEnabled } from "@/lib/torneo-dev-tools";

export default function AdminTorneoPage() {
  if (!isTorneoDevToolsEnabled()) {
    notFound();
  }

  return <AdminTorneoPanel />;
}
