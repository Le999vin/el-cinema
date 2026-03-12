"use client";

import { format } from "date-fns";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { Showtime } from "@/domain/types";

interface AdminShowtimesManagerProps {
  showtimes: Showtime[];
  movies: Array<{ id: string; title: string }>;
  cinemas: Array<{ id: string; name: string }>;
}

export const AdminShowtimesManager = ({ showtimes, movies, cinemas }: AdminShowtimesManagerProps) => {
  const [rows, setRows] = useState(showtimes);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] p-4 md:grid-cols-[1fr_1fr_160px_120px_140px_120px]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          startTransition(async () => {
            setMessage(null);
            const response = await fetch("/api/admin/showtimes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                movieId: formData.get("movieId"),
                cinemaId: formData.get("cinemaId"),
                startsAt: formData.get("startsAt"),
                language: formData.get("language"),
                subtitleLanguage: formData.get("subtitleLanguage") || null,
                room: formData.get("room") || null,
              }),
            });

            const payload = (await response.json()) as { data?: { showtime?: Showtime }; error?: { message?: string } };

            if (!response.ok || !payload.data?.showtime) {
              setMessage(payload.error?.message ?? "Failed to create showtime.");
              return;
            }

            setRows((current) =>
              [...current, payload.data!.showtime!].sort(
                (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
              ),
            );
            setMessage("Showtime created.");
            event.currentTarget.reset();
          });
        }}
      >
        <select name="movieId" required className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm">
          <option value="">Movie</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
        <select name="cinemaId" required className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm">
          <option value="">Cinema</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>
        <input
          name="startsAt"
          type="datetime-local"
          required
          className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm"
        />
        <input name="language" defaultValue="EN" required className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm" />
        <input name="subtitleLanguage" placeholder="Subtitles" className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm" />
        <input name="room" placeholder="Room" className="h-10 rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-2 text-sm" />
        <Button type="submit" disabled={isPending}>
          Add
        </Button>
      </form>

      {message ? <p className="text-sm text-[color:var(--text-muted)]">{message}</p> : null}

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] px-4 py-3 text-sm">
            <div>
              <p className="text-[color:var(--text-primary)]">{format(new Date(row.startsAt), "EEE, dd MMM yyyy - HH:mm")}</p>
              <p className="text-[color:var(--text-muted)]">{row.language}{row.subtitleLanguage ? ` • ${row.subtitleLanguage}` : ""}{row.room ? ` • ${row.room}` : ""}</p>
            </div>
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const response = await fetch("/api/admin/showtimes", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: row.id }),
                  });

                  if (response.ok) {
                    setRows((current) => current.filter((entry) => entry.id !== row.id));
                    setMessage("Showtime deleted.");
                  }
                });
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

