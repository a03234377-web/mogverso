export type PageId =
  | "rankings"
  | "rankvote"
  | "torneo"
  | "noticias"
  | "consejo"
  | "lexico"
  | "profile";

export type NavigationProps = {
  page: PageId;
  onNavigate: (page: PageId, desktopTabIndex?: number) => void;
  onOpenDiscord: () => void;
};
