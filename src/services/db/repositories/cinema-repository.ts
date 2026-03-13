import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import type { Cinema } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { cinemas, showtimes } from "@/services/db/schema";
import { mapCinema } from "@/services/db/repositories/mappers";

export type CinemaUpsertInput = Pick<
  Cinema,
  | "googlePlaceId"
  | "name"
  | "address"
  | "city"
  | "region"
  | "district"
  | "lat"
  | "lng"
  | "websiteUrl"
  | "phoneNumber"
  | "chain"
  | "rating"
  | "googleMapsUri"
  | "openingHours"
  | "editorialSummary"
  | "types"
> &
  Partial<Pick<Cinema, "id" | "sourceUpdatedAt" | "detailsSourceUpdatedAt">>;

export interface CinemaListQuery {
  search?: string;
  city?: string;
  limit?: number;
}

export interface CinemaActivity {
  cinemaId: string;
  movieCount: number;
  showtimeCount: number;
}

const buildCinemaSearchCondition = (query: string): SQL | undefined => {
  const trimmed = query.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalizedPattern = `%${trimmed.toLowerCase()}%`;

  return sql`(
    lower(${cinemas.name}) like ${normalizedPattern}
    or lower(${cinemas.address}) like ${normalizedPattern}
    or lower(${cinemas.city}) like ${normalizedPattern}
    or lower(coalesce(${cinemas.district}, '')) like ${normalizedPattern}
    or exists (
      select 1
      from jsonb_array_elements_text(${cinemas.types}) as place_type(value)
      where lower(place_type.value) like ${normalizedPattern}
    )
  )`;
};

const buildCinemaCityCondition = (city: string): SQL | undefined => {
  const trimmed = city.trim();
  if (!trimmed) {
    return undefined;
  }

  return sql`lower(${cinemas.city}) = ${trimmed.toLowerCase()}`;
};

export const listCinemas = async (): Promise<Cinema[]> => {
  const db = getDb();
  const rows = await db.select().from(cinemas).orderBy(asc(cinemas.name));
  return rows.map(mapCinema);
};

export const queryCinemas = async (query: CinemaListQuery = {}): Promise<Cinema[]> => {
  const db = getDb();
  const conditions = [buildCinemaSearchCondition(query.search ?? ""), buildCinemaCityCondition(query.city ?? "")].filter(
    (condition): condition is SQL => Boolean(condition),
  );

  let statement = db.select().from(cinemas).$dynamic();

  if (conditions.length) {
    statement = statement.where(and(...conditions));
  }

  statement = statement.orderBy(asc(cinemas.name));

  if (query.limit) {
    statement = statement.limit(query.limit);
  }

  const rows = await statement;
  return rows.map(mapCinema);
};

export const searchCinemas = async (query: string): Promise<Cinema[]> => queryCinemas({ search: query });

export const getCinemaById = async (cinemaId: string): Promise<Cinema | null> => {
  const db = getDb();
  const row = await db.query.cinemas.findFirst({
    where: eq(cinemas.id, cinemaId),
  });

  return row ? mapCinema(row) : null;
};

export const getCinemaByGooglePlaceId = async (googlePlaceId: string): Promise<Cinema | null> => {
  const db = getDb();
  const row = await db.query.cinemas.findFirst({
    where: eq(cinemas.googlePlaceId, googlePlaceId),
  });

  return row ? mapCinema(row) : null;
};

export const listCinemaActivity = async (cinemaIds: readonly string[]): Promise<CinemaActivity[]> => {
  if (!cinemaIds.length) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      cinemaId: showtimes.cinemaId,
      showtimeCount: sql<number>`count(*)::int`,
      movieCount: sql<number>`count(distinct ${showtimes.movieId})::int`,
    })
    .from(showtimes)
    .where(inArray(showtimes.cinemaId, [...cinemaIds]))
    .groupBy(showtimes.cinemaId);

  return rows.map((row) => ({
    cinemaId: row.cinemaId,
    showtimeCount: row.showtimeCount,
    movieCount: row.movieCount,
  }));
};

export const upsertCinemas = async (payload: CinemaUpsertInput[]): Promise<number> => {
  if (!payload.length) {
    return 0;
  }

  const db = getDb();
  const existingRows = await db.query.cinemas.findMany({
    where: inArray(
      cinemas.googlePlaceId,
      payload.map((cinema) => cinema.googlePlaceId),
    ),
  });

  const existingByGooglePlaceId = new Map(existingRows.map((row) => [row.googlePlaceId, row]));

  const mergedPayload = payload.map((entry) => {
    const existing = existingByGooglePlaceId.get(entry.googlePlaceId);

    return {
      id: entry.id ?? existing?.id,
      googlePlaceId: entry.googlePlaceId,
      name: entry.name,
      address: entry.address,
      city: entry.city,
      region: entry.region,
      district: entry.district ?? existing?.district ?? null,
      lat: entry.lat.toString(),
      lng: entry.lng.toString(),
      websiteUrl: entry.websiteUrl !== undefined ? entry.websiteUrl : existing?.websiteUrl ?? null,
      phoneNumber: entry.phoneNumber !== undefined ? entry.phoneNumber : existing?.phoneNumber ?? null,
      chain: entry.chain !== undefined ? entry.chain : existing?.chain ?? null,
      rating: entry.rating !== undefined && entry.rating !== null ? entry.rating.toFixed(1) : entry.rating ?? existing?.rating ?? null,
      googleMapsUri: entry.googleMapsUri !== undefined ? entry.googleMapsUri : existing?.googleMapsUri ?? null,
      openingHours: entry.openingHours !== undefined ? entry.openingHours : existing?.openingHours ?? [],
      editorialSummary:
        entry.editorialSummary !== undefined ? entry.editorialSummary : existing?.editorialSummary ?? null,
      types: entry.types !== undefined ? entry.types : existing?.types ?? [],
      sourceUpdatedAt: entry.sourceUpdatedAt ?? existing?.sourceUpdatedAt ?? new Date(),
      detailsSourceUpdatedAt: entry.detailsSourceUpdatedAt ?? existing?.detailsSourceUpdatedAt ?? null,
      updatedAt: new Date(),
    };
  });

  await db
    .insert(cinemas)
    .values(mergedPayload)
    .onConflictDoUpdate({
      target: cinemas.googlePlaceId,
      set: {
        name: sql`excluded.name`,
        address: sql`excluded.address`,
        city: sql`excluded.city`,
        region: sql`excluded.region`,
        district: sql`excluded.district`,
        lat: sql`excluded.lat`,
        lng: sql`excluded.lng`,
        websiteUrl: sql`excluded.website_url`,
        phoneNumber: sql`excluded.phone_number`,
        chain: sql`excluded.chain`,
        rating: sql`excluded.rating`,
        googleMapsUri: sql`excluded.google_maps_uri`,
        openingHours: sql`excluded.opening_hours`,
        editorialSummary: sql`excluded.editorial_summary`,
        types: sql`excluded.types`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
        detailsSourceUpdatedAt: sql`excluded.details_source_updated_at`,
        updatedAt: new Date(),
      },
    });

  return mergedPayload.length;
};
