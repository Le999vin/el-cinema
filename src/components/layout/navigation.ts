import {
  Bookmark,
  CalendarClock,
  CircleUserRound,
  Film,
  House,
  LayoutDashboard,
  MapPinned,
  Settings2,
  Sparkles,
  TvMinimal,
  type LucideIcon,
} from "lucide-react";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV_ITEMS: readonly ShellNavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/cinemas", label: "Cinemas", icon: MapPinned },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/series", label: "Series", icon: TvMinimal },
  { href: "/showtimes", label: "Showtimes", icon: CalendarClock },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

export const SECONDARY_NAV_ITEMS: readonly ShellNavItem[] = [
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;
