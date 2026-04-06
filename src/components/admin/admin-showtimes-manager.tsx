"use client";

import { format } from "date-fns";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import type { Showtime } from "@/domain/types";

interface AdminShowtimesManagerProps {
  showtimes: Showtime[];
  movies: Array<{ id: string; title: string }>;
  cinemas: Array<{ id: string; name: string }>;
}

export const AdminShowtimesManager = ({ showtimes, movies, cinemas }: AdminShowtimesManagerProps) => {
  const { toast } = useToast();
  const [rows, setRows] = useState(showtimes);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const response = await fetch("/api/admin/showtimes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setRows((current) => current.filter((entry) => entry.id !== id));
        setConfirmId(null);
        toast("Showtime deleted", "success");
      } else {
        toast("Failed to delete showtime", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] p-4 md:grid-cols-[1fr_1fr_160px_120px_140px_120px]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);

          startTransition(async () => {
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
              toast(payload.error?.message ?? "Failed to create showtime.", "error");
              return;
            }

            setRows((current) =>
              [...current, payload.data!.showtime!].sort(
                (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
              ),
            );
            toast("Showtime created", "success");
            event.currentTarget.reset();
          });
        }}
      >
        <Select name="movieId" required>
          <option value="">Movie</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>{movie.title}</option>
          ))}
        </Select>
        <Select name="cinemaId" required>
          <option value="">Cinema</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
          ))}
        </Select>
        <input
          name="startsAt"
          type="datetime-local"
          required
          className="h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-soft)] focus:outline-none"
        />
        <Input name="language" defaultValue="EN" required placeholder="Language" />
        <Input name="subtitleLanguage" placeholder="Subtitles" />
        <Input name="room" placeholder="Room" />
        <Button type="submit" disabled={isPending}>
          Add
        </Button>
      </form>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] px-4 py-3 text-sm">
            <div>
              <p className="text-[color:var(--text-primary)]">{format(new Date(row.startsAt), "EEE, dd MMM yyyy - HH:mm")}</p>
              <p className="text-[color:var(--text-muted)]">{row.language}{row.subtitleLanguage ? ` • ${row.subtitleLanguage}` : ""}{row.room ? ` • ${row.room}` : ""}</p>
            </div>
            {confirmId === row.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[color:var(--text-muted)]">Confirm delete?</span>
                <Button
                  variant="ghost"
                  disabled={isPending}
                  className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(row.id)}
                >
                  Yes, delete
                </Button>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setConfirmId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                disabled={isPending}
                className="gap-1.5 text-[color:var(--text-muted)] hover:text-red-400"
                onClick={() => setConfirmId(row.id)}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
