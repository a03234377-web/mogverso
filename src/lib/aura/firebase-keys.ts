/** Clave segura en RTDB (evita `.` `#` `$` `[` `]` `/` en paths interpolados). */
export function auraScoreKey(name: string): string {
  return name.trim();
}
