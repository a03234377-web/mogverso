/** Panel /admin/torneo solo en dev o con flag explícito en staging. */
export function isTorneoDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_ENABLE_TORNEO_DEV_TOOLS === "true";
}
