"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";
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
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
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
            toast(payload.error?.message ?? "Could not save rating.", "error");
            return;
          }

          toast("Rating saved", "success");
          router.refresh();
        });
      }}
    >
      <p className="text-sm font-semibold text-[color:var(--text-primary)]">Rate this film</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="space-y-1 text-sm text-[color:var(--text-secondary)]">
            <span className="capitalize">{field}</span>
            <Select
              name={field}
              defaultValue={initial ? String(initial[field]) : String(defaultRatings[field])}
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                <option key={value} value={value}>
                  {value.toFixed(1)}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>

      <label className="block space-y-1 text-sm text-[color:var(--text-secondary)]">
        <span>Optional note</span>
        <textarea
          name="note"
          defaultValue={initial?.note ?? ""}
          rows={3}
          className="w-full rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--panel)] px-3 py-2 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-soft)] focus:outline-none"
          placeholder="What stood out for you?"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending && <Spinner className="h-4 w-4" />}
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
                toast("Rating removed", "success");
                router.refresh();
              });
            }}
          >
            Delete rating
          </Button>
        ) : null}
      </div>
    </form>
  );
};
