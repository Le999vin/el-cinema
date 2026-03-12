import type { Cinema, Movie, Showtime, User, UserPreferences, UserRating, WatchlistItem } from "@/domain/types";
import type {
  cinemas,
  favouriteCinemas,
  movies,
  seenMovies,
  showtimes,
  userPreferences,
  userRatings,
  users,
  watchlistItems,
} from "@/services/db/schema";

type CinemaRow = typeof cinemas.$inferSelect;
type MovieRow = typeof movies.$inferSelect;
type ShowtimeRow = typeof showtimes.$inferSelect;
type UserRow = typeof users.$inferSelect;
type UserPreferencesRow = typeof userPreferences.$inferSelect;
type UserRatingRow = typeof userRatings.$inferSelect;
type WatchlistRow = typeof watchlistItems.$inferSelect;
type SeenRow = typeof seenMovies.$inferSelect;
type FavouriteRow = typeof favouriteCinemas.$inferSelect;

const asNumber = (value: string | number | null | undefined): number => {
  if (value == null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number.parseFloat(value);
};

export const mapCinema = (row: CinemaRow): Cinema => ({
  id: row.id,
  googlePlaceId: row.googlePlaceId,
  name: row.name,
  address: row.address,
  city: row.city,
  region: row.region as Cinema["region"],
  district: row.district,
  lat: asNumber(row.lat),
  lng: asNumber(row.lng),
  websiteUrl: row.websiteUrl,
  phoneNumber: row.phoneNumber,
  chain: row.chain,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapMovie = (row: MovieRow): Movie => ({
  id: row.id,
  tmdbId: row.tmdbId,
  title: row.title,
  overview: row.overview,
  genres: row.genres,
  runtimeMinutes: row.runtimeMinutes,
  posterUrl: row.posterUrl,
  backdropUrl: row.backdropUrl,
  releaseDate: row.releaseDate,
  voteAverage: row.voteAverage == null ? null : asNumber(row.voteAverage),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapShowtime = (row: ShowtimeRow): Showtime => ({
  id: row.id,
  cinemaId: row.cinemaId,
  movieId: row.movieId,
  startsAt: row.startsAt,
  language: row.language,
  subtitleLanguage: row.subtitleLanguage,
  room: row.room,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  displayName: row.displayName,
  passwordHash: row.passwordHash,
  role: row.role as User["role"],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapUserPreferences = (row: UserPreferencesRow): UserPreferences => ({
  userId: row.userId,
  favouriteGenres: row.favouriteGenres ?? [],
  preferredTimeStart: row.preferredTimeStart,
  preferredTimeEnd: row.preferredTimeEnd,
  preferredCinemaIds: row.preferredCinemaIds ?? [],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapUserRating = (row: UserRatingRow): UserRating => ({
  userId: row.userId,
  movieId: row.movieId,
  story: asNumber(row.story),
  tension: asNumber(row.tension),
  acting: asNumber(row.acting),
  visuals: asNumber(row.visuals),
  soundtrack: asNumber(row.soundtrack),
  overall: asNumber(row.overall),
  note: row.note,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapWatchlistItem = (row: WatchlistRow): WatchlistItem => ({
  userId: row.userId,
  movieId: row.movieId,
  createdAt: row.createdAt,
});

export const mapSeenMovieId = (row: SeenRow): string => row.movieId;
export const mapFavouriteCinemaId = (row: FavouriteRow): string => row.cinemaId;

