import { getNextMadrid23Ms } from "@/lib/spain-time";

/** Próximo reinicio del torneo a las 23:00 (hora peninsular). */
export function getNext23Ms(from = Date.now()): number {
  return getNextMadrid23Ms(from);
}
