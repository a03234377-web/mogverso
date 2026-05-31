const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  Home: "Home",
  End: "End",
  Tab: "Tab",
} as const;

export function isEscape(key: string): boolean {
  return key === Keys.Escape;
}
