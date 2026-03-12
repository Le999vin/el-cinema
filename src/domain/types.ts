export type RegionCode = "ZH";

export type UserRole = "user" | "admin";

export type Genre =
  | "Action"
  | "Adventure"
  | "Animation"
  | "Comedy"
  | "Crime"
  | "Documentary"
  | "Drama"
  | "Family"
  | "Fantasy"
  | "History"
  | "Horror"
  | "Music"
  | "Mystery"
  | "Romance"
  | "Science Fiction"
  | "Thriller"
  | "War"
  | "Western"
  | string;

export interface Cinema {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  city: string;
  region: RegionCode;
  district?: string | null;
  lat: number;
  lng: number;
  websiteUrl?: string | null;
  phoneNumber?: string | null;
  chain?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CinemaSummary {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string | null;
  websiteUrl?: string | null;
  movieCount: number;
  showtimeCount: number;
}

export interface CinemaDetails extends Cinema {
  showtimes: Showtime[];
  movies: MovieSummary[];
  isFavourite?: boolean;
}

export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  genres: Genre[];
  runtimeMinutes?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  releaseDate?: string | null;
  voteAverage?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieSummary {
  id: string;
  tmdbId: number;
  title: string;
  genres: Genre[];
  posterUrl?: string | null;
  releaseDate?: string | null;
  runtimeMinutes?: number | null;
}

export interface MovieDetails extends Movie {
  showtimes: Showtime[];
  cinemas: CinemaSummary[];
  userRating?: UserRating | null;
  onWatchlist?: boolean;
  seen?: boolean;
}

export interface Showtime {
  id: string;
  cinemaId: string;
  movieId: string;
  startsAt: Date;
  language: string;
  subtitleLanguage?: string | null;
  room?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  favouriteGenres: Genre[];
  preferredTimeStart?: number | null;
  preferredTimeEnd?: number | null;
  preferredCinemaIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  user: Pick<User, "id" | "email" | "displayName" | "role">;
  preferences: UserPreferences;
  favouriteCinemaIds: string[];
  watchlistMovieIds: string[];
  seenMovieIds: string[];
  ratings: UserRating[];
}

export interface UserRating {
  userId: string;
  movieId: string;
  story: number;
  tension: number;
  acting: number;
  visuals: number;
  soundtrack: number;
  overall: number;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItem {
  userId: string;
  movieId: string;
  createdAt: Date;
}

export interface RecommendationInput {
  profile: UserProfile;
  cinemas: Cinema[];
  movies: Movie[];
  showtimes: Showtime[];
  now: Date;
}

export interface RecommendationCandidate {
  movie: Movie;
  cinema: Cinema;
  showtime: Showtime;
}

export interface RecommendationReason {
  kind: "genre" | "rating-history" | "cinema" | "time-window" | "watchlist" | "freshness";
  message: string;
}

export interface RecommendationResult {
  movie: Movie;
  cinema: Cinema;
  showtime: Showtime;
  score: number;
  reasons: RecommendationReason[];
}

export interface DashboardStats {
  watchlistCount: number;
  seenCount: number;
  ratingsCount: number;
  favouriteCinemaCount: number;
  averageOverallRating?: number;
  topGenres: Array<{ genre: Genre; score: number }>;
  totalUpcomingShowtimes: number;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: AppError };

export interface TasteProfile {
  genreAffinity: Record<string, number>;
  criterionAverages: {
    story: number;
    tension: number;
    acting: number;
    visuals: number;
    soundtrack: number;
    overall: number;
  };
  prefersEvening: boolean;
}

export interface RecommendationWeights {
  genreWeight: number;
  ratingHistoryWeight: number;
  cinemaWeight: number;
  timeWeight: number;
  watchlistWeight: number;
  freshnessWeight: number;
}

