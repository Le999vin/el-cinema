import { z } from "zod";

const ratingStepSchema = z
  .number()
  .min(0.5)
  .max(5)
  .refine((value) => Math.round(value * 2) / 2 === value, {
    message: "Rating must be in 0.5 increments",
  });

export const regionSchema = z.literal("ZH");

export const cinemaSchema = z.object({
  id: z.string().uuid(),
  googlePlaceId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  region: regionSchema,
  district: z.string().nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  websiteUrl: z.string().url().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  chain: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const cinemaSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  district: z.string().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  movieCount: z.number().int().nonnegative(),
  showtimeCount: z.number().int().nonnegative(),
});

export const movieSchema = z.object({
  id: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  overview: z.string().min(1),
  genres: z.array(z.string().min(1)).default([]),
  runtimeMinutes: z.number().int().positive().nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
  backdropUrl: z.string().url().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  voteAverage: z.number().min(0).max(10).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const movieSummarySchema = z.object({
  id: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  genres: z.array(z.string().min(1)).default([]),
  posterUrl: z.string().url().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  runtimeMinutes: z.number().int().positive().nullable().optional(),
});

export const showtimeSchema = z.object({
  id: z.string().uuid(),
  cinemaId: z.string().uuid(),
  movieId: z.string().uuid(),
  startsAt: z.date(),
  language: z.string().min(1),
  subtitleLanguage: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
  passwordHash: z.string().min(1),
  role: z.enum(["user", "admin"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userPreferencesSchema = z.object({
  userId: z.string().uuid(),
  favouriteGenres: z.array(z.string()).default([]),
  preferredTimeStart: z.number().int().min(0).max(23).nullable().optional(),
  preferredTimeEnd: z.number().int().min(0).max(23).nullable().optional(),
  preferredCinemaIds: z.array(z.string().uuid()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userRatingSchema = z.object({
  userId: z.string().uuid(),
  movieId: z.string().uuid(),
  story: ratingStepSchema,
  tension: ratingStepSchema,
  acting: ratingStepSchema,
  visuals: ratingStepSchema,
  soundtrack: ratingStepSchema,
  overall: ratingStepSchema,
  note: z.string().max(800).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const watchlistItemSchema = z.object({
  userId: z.string().uuid(),
  movieId: z.string().uuid(),
  createdAt: z.date(),
});

export const recommendationReasonSchema = z.object({
  kind: z.enum(["genre", "rating-history", "cinema", "time-window", "watchlist", "freshness"]),
  message: z.string().min(1),
});

export const recommendationResultSchema = z.object({
  movie: movieSchema,
  cinema: cinemaSchema,
  showtime: showtimeSchema,
  score: z.number(),
  reasons: z.array(recommendationReasonSchema),
});

export const dashboardStatsSchema = z.object({
  watchlistCount: z.number().int().nonnegative(),
  seenCount: z.number().int().nonnegative(),
  ratingsCount: z.number().int().nonnegative(),
  favouriteCinemaCount: z.number().int().nonnegative(),
  averageOverallRating: z.number().nullable().optional(),
  topGenres: z.array(
    z.object({
      genre: z.string().min(1),
      score: z.number(),
    }),
  ),
  totalUpcomingShowtimes: z.number().int().nonnegative(),
});

export const appErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
});

export const asyncStateSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    z.object({ status: z.literal("idle") }),
    z.object({ status: z.literal("loading") }),
    z.object({ status: z.literal("success"), data: dataSchema }),
    z.object({ status: z.literal("error"), error: appErrorSchema }),
  ]);

export const registerInputSchema = z.object({
  displayName: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const preferenceInputSchema = z.object({
  favouriteGenres: z.array(z.string()).default([]),
  preferredTimeStart: z.number().int().min(0).max(23).nullable().optional(),
  preferredTimeEnd: z.number().int().min(0).max(23).nullable().optional(),
  preferredCinemaIds: z.array(z.string().uuid()).default([]),
});

export const watchlistInputSchema = z.object({
  movieId: z.string().uuid(),
});

export const seenInputSchema = z.object({
  movieId: z.string().uuid(),
  seen: z.boolean(),
});

export const favouriteCinemaInputSchema = z.object({
  cinemaId: z.string().uuid(),
});

export const ratingInputSchema = z.object({
  movieId: z.string().uuid(),
  story: ratingStepSchema,
  tension: ratingStepSchema,
  acting: ratingStepSchema,
  visuals: ratingStepSchema,
  soundtrack: ratingStepSchema,
  overall: ratingStepSchema,
  note: z.string().max(800).nullable().optional(),
});

export const showtimeInputSchema = z.object({
  cinemaId: z.string().uuid(),
  movieId: z.string().uuid(),
  startsAt: z.coerce.date(),
  language: z.string().min(1),
  subtitleLanguage: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
});

export const recommendationWeightsSchema = z.object({
  genreWeight: z.number().nonnegative(),
  ratingHistoryWeight: z.number().nonnegative(),
  cinemaWeight: z.number().nonnegative(),
  timeWeight: z.number().nonnegative(),
  watchlistWeight: z.number().nonnegative(),
  freshnessWeight: z.number().nonnegative(),
});

