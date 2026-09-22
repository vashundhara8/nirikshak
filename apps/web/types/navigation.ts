export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeVariant?: "neutral" | "warning" | "success" | "info";
  active?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
