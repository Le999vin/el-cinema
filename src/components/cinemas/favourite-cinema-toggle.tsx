"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

interface FavouriteCinemaToggleProps {
  cinemaId: string;
  initialFavourite: boolean;
}

export const FavouriteCinemaToggle = ({ cinemaId, initialFavourite }: FavouriteCinemaToggleProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [favourite, setFavourite] = useState(initialFavourite);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={favourite ? "primary" : "secondary"}
      disabled={isPending}
      className="gap-2"
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/user/favourites", {
            method: favourite ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cinemaId }),
          });
          const next = !favourite;
          setFavourite(next);
          toast(next ? "Saved to favourites" : "Removed from favourites", "success");
          router.refresh();
        });
      }}
    >
      {isPending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <Heart size={16} fill={favourite ? "currentColor" : "none"} />
      )}
      {favourite ? "Unfavourite" : "Favourite"}
    </Button>
  );
};
