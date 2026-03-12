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
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={favourite ? "primary" : "secondary"}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/user/favourites", {
            method: favourite ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cinemaId }),
          });
          setFavourite((current) => !current);
          router.refresh();
        });
      }}
    >
      {favourite ? "Remove favourite" : "Save favourite"}
    </Button>
  );
};

