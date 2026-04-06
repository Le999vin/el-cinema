export const APP_NAME = "CinemaScope";
export const ACTIVE_CITY = "Zurich";
export const ACTIVE_REGION = "ZH" as const;

export const DEFAULT_RECOMMENDATION_LIMIT = 5;

export const MOVIE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
] as const;

export type NavItem = { href: string; label: string; icon: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/cinemas", label: "Cinemas", icon: "MapPin" },
  { href: "/movies", label: "Movies", icon: "Film" },
  { href: "/series", label: "Series", icon: "Tv" },
  { href: "/showtimes", label: "Showtimes", icon: "Calendar" },
  { href: "/recommendations", label: "Recommendations", icon: "Sparkles" },
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
];

export const LOWER_NAV_ITEMS: NavItem[] = [
  { href: "/watchlist", label: "Watchlist", icon: "Bookmark" },
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export const SESSION_COOKIE_NAME = "cinemascope_session";
export const SESSION_DURATION_DAYS = 14;
