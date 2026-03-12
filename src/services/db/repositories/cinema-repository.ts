import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import type { Cinema } from "@/domain/types";
import { getDb } from "@/services/db/client";
import { cinemas } from "@/services/db/schema";
import { mapCinema } from "@/services/db/repositories/mappers";

export const listCinemas = async (city?: string): Promise<Cinema[]> => {
  const db = getDb();

  const rows = city
    ? await db
        .select()
        .from(cinemas)
        .where(and(eq(cinemas.city, city), eq(cinemas.region, "ZH")))
        .orderBy(asc(cinemas.name))
    : await db.select().from(cinemas).orderBy(asc(cinemas.name));

  return rows.map(mapCinema);
};

export const searchCinemas = async (query: string): Promise<Cinema[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(cinemas)
    .where(
      sql`${cinemas.region} = 'ZH' and (${cinemas.name} ilike ${`%${query}%`} or ${cinemas.address} ilike ${`%${query}%`})`,
    )
    .orderBy(asc(cinemas.name));

  return rows.map(mapCinema);
};

export const getCinemaById = async (cinemaId: string): Promise<Cinema | null> => {
  const db = getDb();
  const row = await db.query.cinemas.findFirst({
    where: eq(cinemas.id, cinemaId),
  });

  return row ? mapCinema(row) : null;
};

export const upsertCinemas = async (
  payload: Array<
    Pick<
      Cinema,
      "googlePlaceId" | "name" | "address" | "city" | "region" | "district" | "lat" | "lng" | "websiteUrl" | "phoneNumber" | "chain"
    >
  >,
): Promise<number> => {
  if (!payload.length) {
    return 0;
  }

  const db = getDb();

  await db
    .insert(cinemas)
    .values(
      payload.map((cinema) => ({
        googlePlaceId: cinema.googlePlaceId,
        name: cinema.name,
        address: cinema.address,
        city: cinema.city,
        region: cinema.region,
        district: cinema.district,
        lat: cinema.lat.toString(),
        lng: cinema.lng.toString(),
        websiteUrl: cinema.websiteUrl,
        phoneNumber: cinema.phoneNumber,
        chain: cinema.chain,
        sourceUpdatedAt: new Date(),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: cinemas.googlePlaceId,
      set: {
        name: sql`excluded.name`,
        address: sql`excluded.address`,
        city: sql`excluded.city`,
        district: sql`excluded.district`,
        lat: sql`excluded.lat`,
        lng: sql`excluded.lng`,
        websiteUrl: sql`excluded.website_url`,
        phoneNumber: sql`excluded.phone_number`,
        chain: sql`excluded.chain`,
        sourceUpdatedAt: sql`excluded.source_updated_at`,
        updatedAt: new Date(),
      },
    });

  return payload.length;
};

