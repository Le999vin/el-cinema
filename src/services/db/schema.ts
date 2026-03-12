import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 20 }).notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sessions_token_hash_unique").on(table.tokenHash), index("sessions_user_id_idx").on(table.userId)],
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .primaryKey(),
    favouriteGenres: jsonb("favourite_genres").$type<string[]>().notNull().default([]),
    preferredTimeStart: integer("preferred_time_start"),
    preferredTimeEnd: integer("preferred_time_end"),
    preferredCinemaIds: jsonb("preferred_cinema_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("user_preferences_user_idx").on(table.userId)],
);

export const cinemas = pgTable(
  "cinemas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    googlePlaceId: text("google_place_id").notNull(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: varchar("region", { length: 10 }).notNull().default("ZH"),
    district: text("district"),
    lat: numeric("lat", { precision: 10, scale: 7 }).notNull(),
    lng: numeric("lng", { precision: 10, scale: 7 }).notNull(),
    websiteUrl: text("website_url"),
    phoneNumber: text("phone_number"),
    chain: text("chain"),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cinemas_google_place_id_unique").on(table.googlePlaceId),
    index("cinemas_city_idx").on(table.city),
    index("cinemas_region_idx").on(table.region),
  ],
);

export const movies = pgTable(
  "movies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tmdbId: integer("tmdb_id").notNull(),
    title: text("title").notNull(),
    overview: text("overview").notNull(),
    genres: jsonb("genres").$type<string[]>().notNull().default([]),
    runtimeMinutes: integer("runtime_minutes"),
    posterUrl: text("poster_url"),
    backdropUrl: text("backdrop_url"),
    releaseDate: varchar("release_date", { length: 20 }),
    voteAverage: numeric("vote_average", { precision: 3, scale: 1 }),
    sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("movies_tmdb_id_unique").on(table.tmdbId), index("movies_title_idx").on(table.title)],
);

export const showtimes = pgTable(
  "showtimes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cinemaId: uuid("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    subtitleLanguage: varchar("subtitle_language", { length: 50 }),
    room: varchar("room", { length: 100 }),
    manuallyManaged: boolean("manually_managed").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("showtimes_cinema_idx").on(table.cinemaId),
    index("showtimes_movie_idx").on(table.movieId),
    index("showtimes_starts_at_idx").on(table.startsAt),
  ],
);

export const watchlistItems = pgTable(
  "watchlist_items",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId], name: "watchlist_items_pk" }),
    index("watchlist_user_idx").on(table.userId),
  ],
);

export const seenMovies = pgTable(
  "seen_movies",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    seenAt: timestamp("seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId], name: "seen_movies_pk" }),
    index("seen_user_idx").on(table.userId),
  ],
);

export const favouriteCinemas = pgTable(
  "favourite_cinemas",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cinemaId: uuid("cinema_id")
      .notNull()
      .references(() => cinemas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cinemaId], name: "favourite_cinemas_pk" }),
    index("favourite_cinemas_user_idx").on(table.userId),
  ],
);

export const userRatings = pgTable(
  "user_ratings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => movies.id, { onDelete: "cascade" }),
    story: numeric("story", { precision: 2, scale: 1 }).notNull(),
    tension: numeric("tension", { precision: 2, scale: 1 }).notNull(),
    acting: numeric("acting", { precision: 2, scale: 1 }).notNull(),
    visuals: numeric("visuals", { precision: 2, scale: 1 }).notNull(),
    soundtrack: numeric("soundtrack", { precision: 2, scale: 1 }).notNull(),
    overall: numeric("overall", { precision: 2, scale: 1 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.movieId], name: "user_ratings_pk" }),
    index("user_ratings_user_idx").on(table.userId),
  ],
);

export const syncRuns = pgTable(
  "sync_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: varchar("source", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [index("sync_runs_source_idx").on(table.source)],
);

export const userRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  watchlistItems: many(watchlistItems),
  seenMovies: many(seenMovies),
  favouriteCinemas: many(favouriteCinemas),
  ratings: many(userRatings),
}));

export const cinemaRelations = relations(cinemas, ({ many }) => ({
  showtimes: many(showtimes),
  favourites: many(favouriteCinemas),
}));

export const movieRelations = relations(movies, ({ many }) => ({
  showtimes: many(showtimes),
  ratings: many(userRatings),
  watchlistItems: many(watchlistItems),
  seenEntries: many(seenMovies),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const showtimeRelations = relations(showtimes, ({ one }) => ({
  cinema: one(cinemas, {
    fields: [showtimes.cinemaId],
    references: [cinemas.id],
  }),
  movie: one(movies, {
    fields: [showtimes.movieId],
    references: [movies.id],
  }),
}));

