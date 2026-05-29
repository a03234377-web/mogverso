import type { LooksMaxHeaderProps } from "@/components/layout/header/types";

export type LooksMaxFooterProps = LooksMaxHeaderProps & {
  moreOpen: boolean;
  onToggleMore: () => void;
};
