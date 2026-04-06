"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface FavouriteCinemaToggleProps {
  cinemaId: string;
  initialFavourite: boolean;
}

export const FavouriteCinemaToggle = ({ cinemaId, initialFavourite }: FavouriteCinemaToggleProps) => {
  const router = useRouter();
  const [favourite, setFavourite] = useState(initialFavourite);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        variant={favourite ? "primary" : "secondary"}
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            setMessage(null);
            const response = await fetch("/api/user/favourites", {
              method: favourite ? "DELETE" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cinemaId }),
            });

            if (!response.ok) {
              setMessage("Could not update favourite cinemas.");
              return;
            }

            setFavourite((current) => !current);
            setMessage(favourite ? "Removed from favourites." : "Saved to your favourites.");
            router.refresh();
          });
        }}
      >
        {favourite ? "Remove favourite" : "Save favourite"}
      </Button>
      <p aria-live="polite" className="text-sm text-[color:var(--text-muted)]">
        {message ?? ""}
      </p>
    </div>
  );
};
