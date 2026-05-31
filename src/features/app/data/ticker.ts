import type { IconName } from "@/types/icons";

export type TickerItem = {
  id: string;
  icon: IconName;
  text: string;
  labelClass?: string;
};
