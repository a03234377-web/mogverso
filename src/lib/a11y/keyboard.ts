export const Keys = {
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

export function isActivationKey(key: string): boolean {
  return key === Keys.Enter || key === Keys.Space;
}

export function isEscape(key: string): boolean {
  return key === Keys.Escape;
}

export function isHorizontalArrow(key: string): boolean {
  return key === Keys.ArrowLeft || key === Keys.ArrowRight;
}

export function isVerticalArrow(key: string): boolean {
  return key === Keys.ArrowUp || key === Keys.ArrowDown;
}
