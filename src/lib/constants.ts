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

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/cinemas", label: "Cinemas" },
  { href: "/movies", label: "Movies" },
  { href: "/series", label: "Series" },
  { href: "/showtimes", label: "Showtimes" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export const LOWER_NAV_ITEMS = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
] as const;

export const SESSION_COOKIE_NAME = "cinemascope_session";
export const SESSION_DURATION_DAYS = 14;
