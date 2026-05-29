export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m} min ${s}s` : `${s} seg`;
}
