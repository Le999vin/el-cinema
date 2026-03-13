"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOVIE_GENRES } from "@/lib/constants";

interface OnboardingFormProps {
  cinemaOptions: Array<{ id: string; name: string }>;
}

export const OnboardingForm = ({ cinemaOptions }: OnboardingFormProps) => {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCinemas, setSelectedCinemas] = useState<string[]>([]);
  const [cinemaFilter, setCinemaFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const genreGroups = useMemo(
    () => [MOVIE_GENRES.slice(0, 9), MOVIE_GENRES.slice(9)],
    [],
  );
  const visibleCinemaOptions = useMemo(() => {
    const normalized = cinemaFilter.trim().toLowerCase();
    if (!normalized) {
      return cinemaOptions;
    }

    return cinemaOptions.filter((cinema) => cinema.name.toLowerCase().includes(normalized));
  }, [cinemaFilter, cinemaOptions]);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setError(null);

          const response = await fetch("/api/user/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              favouriteGenres: selectedGenres,
              preferredTimeStart: Number(formData.get("timeStart")),
              preferredTimeEnd: Number(formData.get("timeEnd")),
              preferredCinemaIds: selectedCinemas,
            }),
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: { message?: string } };
            setError(payload.error?.message ?? "Failed to save preferences.");
            return;
          }

          router.push("/dashboard");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--text-primary)]">Tune your profile</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">These settings shape your first recommendations.</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[color:var(--text-secondary)]">Favourite genres</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {genreGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {group.map((genre) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <button
                    type="button"
                    key={genre}
                    onClick={() =>
                      setSelectedGenres((current) =>
                        selected ? current.filter((item) => item !== genre) : [...current, genre],
                      )
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/20 text-[color:var(--text-primary)]"
                        : "border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] text-[color:var(--text-secondary)]"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-[color:var(--text-secondary)]">Preferred start hour</span>
          <Input name="timeStart" type="number" min={0} max={23} defaultValue={18} />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-[color:var(--text-secondary)]">Preferred end hour</span>
          <Input name="timeEnd" type="number" min={0} max={23} defaultValue={23} />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-[color:var(--text-secondary)]">Preferred cinemas</p>
        <Input
          value={cinemaFilter}
          onChange={(event) => setCinemaFilter(event.target.value)}
          placeholder="Filter cinemas by name"
        />
        <div className="grid gap-2">
          {visibleCinemaOptions.map((cinema) => {
            const selected = selectedCinemas.includes(cinema.id);
            return (
              <button
                type="button"
                key={cinema.id}
                onClick={() =>
                  setSelectedCinemas((current) =>
                    selected ? current.filter((item) => item !== cinema.id) : [...current, cinema.id],
                  )
                }
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/15 text-[color:var(--text-primary)]"
                    : "border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] text-[color:var(--text-secondary)]"
                }`}
              >
                {cinema.name}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
};
