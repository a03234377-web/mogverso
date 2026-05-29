import type { PageId } from "@/features/app/types";

export type LooksMaxHeaderProps = {
  page: PageId;
  onOpenDiscord: () => void;
};

export type LooksMaxFooterProps = LooksMaxHeaderProps & {
  moreOpen: boolean;
  onToggleMore: () => void;
};
