import { addDays, setHours, setMinutes } from "date-fns";

import type { Cinema, Movie, Showtime } from "@/domain/types";

const now = new Date();

export const demoCinemas: Cinema[] = [
  {
    id: "bca2beff-374f-4f4a-925e-af09f92b11d1",
    googlePlaceId: "ChIJvy7Pzj4LkEcR14vJdrJwQn4",
    name: "Arthouse Le Paris",
    address: "Gottfried-Keller-Strasse 7, 8001 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "City",
    lat: 47.3699,
    lng: 8.5428,
    websiteUrl: "https://www.arthouse.ch",
    phoneNumber: "+41 44 221 22 83",
    chain: "Arthouse",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2f6a07e5-fe20-4dbd-92c4-98bf35b4f2d6",
    googlePlaceId: "ChIJf7GR9j4LkEcRp5WajTZJIoE",
    name: "Arthouse Piccadilly",
    address: "Mühlebachstrasse 2, 8008 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "Seefeld",
    lat: 47.3669,
    lng: 8.5462,
    websiteUrl: "https://www.arthouse.ch",
    phoneNumber: "+41 44 250 55 55",
    chain: "Arthouse",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "1d96fa42-5587-42f8-bf8c-42f66e2d3f79",
    googlePlaceId: "ChIJM7x0L08LkEcR5x7k0SRTfJ4",
    name: "Kosmos",
    address: "Lagerstrasse 104, 8004 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "Langstrasse",
    lat: 47.3786,
    lng: 8.5315,
    websiteUrl: "https://www.kosmos.ch",
    phoneNumber: "+41 44 297 10 00",
    chain: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "e8b127b7-8f5f-4a11-a03f-709e0095e53d",
    googlePlaceId: "ChIJw7J8sT4LkEcRx1pB47nX4Wo",
    name: "Frame",
    address: "Lagerstrasse 104, 8004 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "Europaallee",
    lat: 47.3782,
    lng: 8.5321,
    websiteUrl: "https://www.frame.ch",
    phoneNumber: "+41 44 555 55 55",
    chain: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "99e2f0a8-61f4-4df6-9fba-1776e4f216fd",
    googlePlaceId: "ChIJbVq4fD4LkEcR0TK6U9f2y4U",
    name: "Riffraff",
    address: "Neugasse 57-63, 8005 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "Kreis 5",
    lat: 47.385,
    lng: 8.5274,
    websiteUrl: "https://www.riffraff.ch",
    phoneNumber: "+41 44 444 22 00",
    chain: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "58bd0a63-8d89-42f3-9861-2d99867b66e8",
    googlePlaceId: "ChIJ6Q0d3j4LkEcR9l5aQ-9i7sA",
    name: "Corso",
    address: "Theaterstrasse 12, 8001 Zurich",
    city: "Zurich",
    region: "ZH",
    district: "Seefeld",
    lat: 47.367,
    lng: 8.5471,
    websiteUrl: "https://www.arthouse.ch",
    phoneNumber: "+41 44 250 55 55",
    chain: "Arthouse",
    createdAt: now,
    updatedAt: now,
  },
];

export const demoMovies: Movie[] = [
  {
    id: "d9c0dbe7-81b8-4c1f-a013-bf161ea8f300",
    tmdbId: 693134,
    title: "Dune: Part Two",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking justice against the conspirators who destroyed his family.",
    genres: ["Science Fiction", "Adventure"],
    runtimeMinutes: 166,
    posterUrl: "https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    releaseDate: "2024-02-28",
    voteAverage: 8.2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "f56c6b8a-92ba-4c6e-88f7-c4cb31d0a5ab",
    tmdbId: 872585,
    title: "Oppenheimer",
    overview:
      "The story of J. Robert Oppenheimer and the creation of the atomic bomb during World War II.",
    genres: ["Drama", "History"],
    runtimeMinutes: 180,
    posterUrl: "https://image.tmdb.org/t/p/w780/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    releaseDate: "2023-07-19",
    voteAverage: 8.1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3936fcb0-94be-4d8c-a423-b11e6de1829f",
    tmdbId: 792307,
    title: "Poor Things",
    overview:
      "Brought back to life by an unorthodox scientist, Bella discovers herself through a whirlwind journey.",
    genres: ["Science Fiction", "Comedy", "Drama"],
    runtimeMinutes: 141,
    posterUrl: "https://image.tmdb.org/t/p/w780/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/zdu8S9s4r4dnQSU82A6mT4A7fXJ.jpg",
    releaseDate: "2023-12-07",
    voteAverage: 7.8,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "9180a9fd-a56f-4b87-9b90-1fa30345352f",
    tmdbId: 986056,
    title: "Anatomy of a Fall",
    overview:
      "A woman is accused of murdering her husband, and their half-blind son faces a moral dilemma as key witness.",
    genres: ["Crime", "Drama", "Mystery"],
    runtimeMinutes: 151,
    posterUrl: "https://image.tmdb.org/t/p/w780/kQs6keheMwCxJxrzV83VUwFtHkB.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/sRLC052ieEzkQs9dEtPMfFxYkej.jpg",
    releaseDate: "2023-08-23",
    voteAverage: 7.8,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "93e19608-7f53-4ecf-a2c2-ac0de1fab095",
    tmdbId: 937287,
    title: "Challengers",
    overview:
      "A former tennis prodigy coaches her husband into a comeback while facing her ex on the court.",
    genres: ["Drama", "Romance"],
    runtimeMinutes: 131,
    posterUrl: "https://image.tmdb.org/t/p/w780/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/tb9rKa71rYQOkt7f2bJ6nX4m0tX.jpg",
    releaseDate: "2024-04-18",
    voteAverage: 7.2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3a7b86cb-3f6d-44a6-bd2d-28f2f3548d57",
    tmdbId: 872906,
    title: "The Zone of Interest",
    overview:
      "The commandant of Auschwitz and his wife create a dream life for their family in a house beside the camp.",
    genres: ["Drama", "History", "War"],
    runtimeMinutes: 105,
    posterUrl: "https://image.tmdb.org/t/p/w780/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/wQziL8D3hD6g8j6fV7lg0PXQ0f7.jpg",
    releaseDate: "2023-12-15",
    voteAverage: 7.3,
    createdAt: now,
    updatedAt: now,
  },
];

const showtimeBase = [
  { dayOffset: 0, hour: 14, minute: 15 },
  { dayOffset: 0, hour: 17, minute: 45 },
  { dayOffset: 0, hour: 20, minute: 30 },
  { dayOffset: 1, hour: 16, minute: 20 },
  { dayOffset: 1, hour: 19, minute: 55 },
  { dayOffset: 2, hour: 18, minute: 10 },
  { dayOffset: 3, hour: 21, minute: 5 },
];

const buildStartsAt = (dayOffset: number, hour: number, minute: number): Date =>
  setMinutes(setHours(addDays(new Date(), dayOffset), hour), minute);

export const buildDemoShowtimes = (): Showtime[] => {
  const combinations = [
    [demoCinemas[0], demoMovies[0], "EN", "DE", "Paris 1"],
    [demoCinemas[1], demoMovies[1], "EN", "DE", "Piccadilly 2"],
    [demoCinemas[2], demoMovies[2], "EN", null, "Saal 3"],
    [demoCinemas[3], demoMovies[4], "EN", "DE", "Room 4"],
    [demoCinemas[4], demoMovies[3], "FR", "DE", "Riffraff 1"],
    [demoCinemas[5], demoMovies[5], "DE", "EN", "Corso Grand"],
  ] as const;

  return combinations.flatMap(([cinema, movie, language, subtitleLanguage, room], idx) =>
    showtimeBase.map((base, baseIndex) => ({
      id: `00000000-0000-4000-8000-${(idx * 10 + baseIndex + 1).toString().padStart(12, "0")}`,
      cinemaId: cinema.id,
      movieId: movie.id,
      startsAt: buildStartsAt(base.dayOffset, base.hour, base.minute + idx),
      language,
      subtitleLanguage,
      room,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );
};

export const demoShowtimes = buildDemoShowtimes();

export const demoAdminUser = {
  email: "admin@cinemascope.ch",
  displayName: "CinemaScope Admin",
  password: "ChangeMeNow!123",
};

