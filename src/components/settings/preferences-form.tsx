"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { MOVIE_GENRES } from "@/lib/constants";

interface PreferencesFormProps {
  initial: {
    favouriteGenres: string[];
    preferredTimeStart?: number | null;
    preferredTimeEnd?: number | null;
    preferredCinemaIds: string[];
  };
  cinemas: Array<{ id: string; name: string }>;
}

export const PreferencesForm = ({ initial, cinemas }: PreferencesFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [genres, setGenres] = useState<string[]>(initial.favouriteGenres);
  const [preferredCinemaIds, setPreferredCinemaIds] = useState<string[]>(initial.preferredCinemaIds);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setMessage(null);
          const response = await fetch("/api/user/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              favouriteGenres: genres,
              preferredTimeStart: Number(formData.get("start")),
              preferredTimeEnd: Number(formData.get("end")),
              preferredCinemaIds,
            }),
          });

          setMessage(response.ok ? "Preferences saved." : "Failed to save preferences.");
          router.refresh();
        });
      }}
    >
      <div>
        <p className="text-sm text-[color:var(--text-secondary)]">Favourite genres</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOVIE_GENRES.map((genre) => {
            const selected = genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() =>
                  setGenres((current) =>
                    selected ? current.filter((entry) => entry !== genre) : [...current, genre],
                  )
                }
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selected
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/20 text-[color:var(--text-primary)]"
                    : "border-[color:var(--border-subtle)] text-[color:var(--text-muted)]"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm text-[color:var(--text-secondary)]">
          <span>Preferred start hour</span>
          <input
            name="start"
            type="number"
            min={0}
            max={23}
            defaultValue={initial.preferredTimeStart ?? 18}
            className="h-10 w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3"
          />
        </label>
        <label className="space-y-1 text-sm text-[color:var(--text-secondary)]">
          <span>Preferred end hour</span>
          <input
            name="end"
            type="number"
            min={0}
            max={23}
            defaultValue={initial.preferredTimeEnd ?? 23}
            className="h-10 w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3"
          />
        </label>
      </div>

      <div>
        <p className="text-sm text-[color:var(--text-secondary)]">Preferred cinemas</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {cinemas.map((cinema) => {
            const selected = preferredCinemaIds.includes(cinema.id);
            return (
              <button
                key={cinema.id}
                type="button"
                onClick={() =>
                  setPreferredCinemaIds((current) =>
                    selected ? current.filter((entry) => entry !== cinema.id) : [...current, cinema.id],
                  )
                }
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  selected
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--text-primary)]"
                    : "border-[color:var(--border-subtle)] text-[color:var(--text-muted)]"
                }`}
              >
                {cinema.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
        {message ? <p className="text-xs text-[color:var(--text-muted)]">{message}</p> : null}
      </div>
    </form>
  );
};

