"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { UserRating } from "@/domain/types";

const fields = ["story", "tension", "acting", "visuals", "soundtrack", "overall"] as const;

type RatingField = (typeof fields)[number];

const defaultRatings = {
  story: 3,
  tension: 3,
  acting: 3,
  visuals: 3,
  soundtrack: 3,
  overall: 3,
};

export const RatingForm = ({ movieId, initial }: { movieId: string; initial?: UserRating | null }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-4 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setMessage(null);
          const response = await fetch("/api/user/ratings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              movieId,
              note: formData.get("note") || null,
              ...fields.reduce<Record<RatingField, number>>(
                (acc, field) => ({
                  ...acc,
                  [field]: Number(formData.get(field)),
                }),
                {
                  story: 3,
                  tension: 3,
                  acting: 3,
                  visuals: 3,
                  soundtrack: 3,
                  overall: 3,
                },
              ),
            }),
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: { message?: string } };
            setMessage(payload.error?.message ?? "Could not save rating.");
            return;
          }

          setMessage("Rating saved.");
          router.refresh();
        });
      }}
    >
      <p className="text-sm font-semibold text-[color:var(--text-primary)]">Rate this film</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="space-y-1 text-sm text-[color:var(--text-secondary)]">
            <span className="capitalize">{field}</span>
            <select
              name={field}
              defaultValue={initial ? String(initial[field]) : String(defaultRatings[field])}
              className="h-10 w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel)] px-2"
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                <option key={value} value={value}>
                  {value.toFixed(1)}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label className="block space-y-1 text-sm text-[color:var(--text-secondary)]">
        <span>Optional note</span>
        <textarea
          name="note"
          defaultValue={initial?.note ?? ""}
          rows={3}
          className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel)] px-3 py-2"
          placeholder="What stood out for you?"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save rating"}
        </Button>
        {initial ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await fetch("/api/user/ratings", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ movieId }),
                });
                router.refresh();
                setMessage("Rating removed.");
              });
            }}
          >
            Delete rating
          </Button>
        ) : null}
      </div>

      {message ? <p className="text-xs text-[color:var(--text-muted)]">{message}</p> : null}
    </form>
  );
};

