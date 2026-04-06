"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface ShowtimesFilterBarProps {
  defaultMode: string;
  defaultMovieId: string;
  defaultCinemaId: string;
  defaultTimeStart: string;
  defaultTimeEnd: string;
  movies: { id: string; title: string }[];
  cinemas: { id: string; name: string }[];
}

export const ShowtimesFilterBar = ({
  defaultMode,
  defaultMovieId,
  defaultCinemaId,
  defaultTimeStart,
  defaultTimeEnd,
  movies,
  cinemas,
}: ShowtimesFilterBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState(defaultMode || "today");
  const [movieId, setMovieId] = useState(defaultMovieId);
  const [cinemaId, setCinemaId] = useState(defaultCinemaId);
  const [timeStart, setTimeStart] = useState(defaultTimeStart);
  const [timeEnd, setTimeEnd] = useState(defaultTimeEnd);

  const hasFilters = mode !== "today" || movieId || cinemaId || timeStart || timeEnd;

  const pushParams = (overrides: {
    mode?: string;
    movieId?: string;
    cinemaId?: string;
    timeStart?: string;
    timeEnd?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const m = overrides.mode ?? mode;
    const mv = overrides.movieId ?? movieId;
    const ci = overrides.cinemaId ?? cinemaId;
    const ts = overrides.timeStart ?? timeStart;
    const te = overrides.timeEnd ?? timeEnd;

    if (m && m !== "today") params.set("mode", m); else params.delete("mode");
    if (mv) params.set("movieId", mv); else params.delete("movieId");
    if (ci) params.set("cinemaId", ci); else params.delete("cinemaId");
    if (ts) params.set("timeStart", ts); else params.delete("timeStart");
    if (te) params.set("timeEnd", te); else params.delete("timeEnd");

    router.push(`/showtimes?${params.toString()}`);
  };

  const handleClear = () => {
    setMode("today");
    setMovieId("");
    setCinemaId("");
    setTimeStart("");
    setTimeEnd("");
    router.push("/showtimes");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={mode}
        onChange={(e) => { setMode(e.target.value); pushParams({ mode: e.target.value }); }}
        className="w-[160px]"
      >
        <option value="today">Today</option>
        <option value="tomorrow">Tomorrow</option>
        <option value="week">This Week</option>
      </Select>

      <Select
        value={movieId}
        onChange={(e) => { setMovieId(e.target.value); pushParams({ movieId: e.target.value }); }}
        className="min-w-[200px] flex-1"
      >
        <option value="">All movies</option>
        {movies.map((movie) => (
          <option key={movie.id} value={movie.id}>{movie.title}</option>
        ))}
      </Select>

      <Select
        value={cinemaId}
        onChange={(e) => { setCinemaId(e.target.value); pushParams({ cinemaId: e.target.value }); }}
        className="min-w-[200px] flex-1"
      >
        <option value="">All cinemas</option>
        {cinemas.map((cinema) => (
          <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
        ))}
      </Select>

      <Input
        type="number"
        min={0}
        max={23}
        placeholder="From (h)"
        value={timeStart}
        onChange={(e) => { setTimeStart(e.target.value); pushParams({ timeStart: e.target.value }); }}
        className="w-[110px]"
      />

      <Input
        type="number"
        min={0}
        max={23}
        placeholder="To (h)"
        value={timeEnd}
        onChange={(e) => { setTimeEnd(e.target.value); pushParams({ timeEnd: e.target.value }); }}
        className="w-[110px]"
      />

      {hasFilters && (
        <Button variant="ghost" onClick={handleClear} className="gap-2 whitespace-nowrap">
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  );
};
