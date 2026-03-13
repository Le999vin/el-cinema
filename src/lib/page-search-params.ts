type SearchParamValue = string | string[] | undefined;
type ResolvedSearchParams = Record<string, string>;

export type PageSearchParams = Record<string, SearchParamValue>;
export type PageSearchParamsInput = PageSearchParams | Promise<PageSearchParams> | undefined;

const firstValue = (value: SearchParamValue): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const pickEnumValue = <T extends string>(
  params: ResolvedSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T => {
  const value = params[key];
  return allowed.includes(value as T) ? (value as T) : fallback;
};

const pickOptionalNumber = (params: ResolvedSearchParams, key: string): number | undefined => {
  const value = params[key];
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const resolvePageSearchParams = async (searchParams: PageSearchParamsInput): Promise<ResolvedSearchParams> => {
  const resolved = (await searchParams) ?? {};

  return Object.fromEntries(
    Object.entries(resolved).map(([key, value]) => [key, firstValue(value)]),
  );
};

export const parseMoviesPageSearchParams = async (searchParams: PageSearchParamsInput) => {
  const params = await resolvePageSearchParams(searchParams);

  return {
    search: params.search ?? "",
    genre: params.genre ?? "",
    sort: pickEnumValue(params, "sort", ["title", "release-date", "runtime"] as const, "release-date"),
  };
};

export const parseSeriesPageSearchParams = async (searchParams: PageSearchParamsInput) => {
  const params = await resolvePageSearchParams(searchParams);

  return {
    search: params.search ?? "",
    genre: params.genre ?? "",
    sort: pickEnumValue(params, "sort", ["title", "release-date", "runtime"] as const, "release-date"),
  };
};

export const parseCinemasPageSearchParams = async (searchParams: PageSearchParamsInput) => {
  const params = await resolvePageSearchParams(searchParams);

  return {
    search: params.search ?? "",
    sort: pickEnumValue(params, "sort", ["name", "showtimes"] as const, "name"),
  };
};

export const parseShowtimesPageSearchParams = async (searchParams: PageSearchParamsInput) => {
  const params = await resolvePageSearchParams(searchParams);

  return {
    mode: pickEnumValue(params, "mode", ["today", "tomorrow", "week"] as const, "today"),
    movieId: params.movieId ?? "",
    cinemaId: params.cinemaId ?? "",
    timeStart: pickOptionalNumber(params, "timeStart"),
    timeEnd: pickOptionalNumber(params, "timeEnd"),
  };
};
