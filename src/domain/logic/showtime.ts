import { endOfDay, endOfWeek, isAfter, isBefore, startOfDay } from "date-fns";

import type { Showtime } from "@/domain/types";

export type DateRangeMode = "today" | "tomorrow" | "week";

export const createDateRangeFilter = (mode: DateRangeMode, now: Date) => {
  if (mode === "today") {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return (showtime: Showtime) => showtime.startsAt >= start && showtime.startsAt <= end;
  }

  if (mode === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = startOfDay(tomorrow);
    const end = endOfDay(tomorrow);
    return (showtime: Showtime) => showtime.startsAt >= start && showtime.startsAt <= end;
  }

  const start = startOfDay(now);
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return (showtime: Showtime) => showtime.startsAt >= start && showtime.startsAt <= end;
};

export const createTimeWindowFilter = (startHour?: number | null, endHour?: number | null) => {
  if (startHour == null && endHour == null) {
    return () => true;
  }

  return (showtime: Showtime): boolean => {
    const hour = showtime.startsAt.getHours();

    if (startHour != null && endHour != null) {
      if (startHour <= endHour) {
        return hour >= startHour && hour <= endHour;
      }

      return hour >= startHour || hour <= endHour;
    }

    if (startHour != null) {
      return hour >= startHour;
    }

    return hour <= (endHour ?? 23);
  };
};

export const createUpcomingFilter = (now: Date) => (showtime: Showtime): boolean => isAfter(showtime.startsAt, now);

export const sortShowtimesByStart = (showtimes: readonly Showtime[]): Showtime[] =>
  [...showtimes].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

export const filterShowtimes = (showtimes: readonly Showtime[], filters: Array<(showtime: Showtime) => boolean>): Showtime[] =>
  showtimes.filter((showtime) => filters.every((filter) => filter(showtime)));

export const groupShowtimesByCinema = (showtimes: readonly Showtime[]): Record<string, Showtime[]> =>
  showtimes.reduce<Record<string, Showtime[]>>((acc, showtime) => {
    const existing = acc[showtime.cinemaId] ?? [];
    return {
      ...acc,
      [showtime.cinemaId]: [...existing, showtime],
    };
  }, {});

export const groupShowtimesByMovie = (showtimes: readonly Showtime[]): Record<string, Showtime[]> =>
  showtimes.reduce<Record<string, Showtime[]>>((acc, showtime) => {
    const existing = acc[showtime.movieId] ?? [];
    return {
      ...acc,
      [showtime.movieId]: [...existing, showtime],
    };
  }, {});

export const isShowtimeInRange = (showtime: Showtime, start: Date, end: Date): boolean =>
  !isBefore(showtime.startsAt, start) && !isAfter(showtime.startsAt, end);

