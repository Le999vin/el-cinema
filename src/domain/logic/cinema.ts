import type { Cinema } from "@/domain/types";

export type CinemaSortMode = "name" | "showtimes";

export const createCityFilter = (city: string) => (cinema: Cinema): boolean =>
  cinema.city.toLowerCase() === city.toLowerCase();

export const createCinemaSearchFilter = (search: string) => {
  const normalized = search.trim().toLowerCase();

  if (!normalized) {
    return () => true;
  }

  return (cinema: Cinema): boolean =>
    [cinema.name, cinema.address, cinema.district ?? "", cinema.chain ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
};

export const sortCinemas = (cinemas: readonly Cinema[], mode: CinemaSortMode): Cinema[] => {
  const copy = [...cinemas];

  if (mode === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name, "en"));
  }

  return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export const filterCinemas = (cinemas: readonly Cinema[], filters: Array<(cinema: Cinema) => boolean>): Cinema[] =>
  cinemas.filter((cinema) => filters.every((filter) => filter(cinema)));

