"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface MovieActionsProps {
  movieId: string;
  initialWatchlist: boolean;
  initialSeen: boolean;
}

export const MovieActions = ({ movieId, initialWatchlist, initialSeen }: MovieActionsProps) => {
  const router = useRouter();
  const [onWatchlist, setOnWatchlist] = useState(initialWatchlist);
  const [seen, setSeen] = useState(initialSeen);
  const [isPending, startTransition] = useTransition();

  const mutateWatchlist = () => {
    startTransition(async () => {
      await fetch("/api/user/watchlist", {
        method: onWatchlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });

      setOnWatchlist((current) => !current);
      router.refresh();
    });
  };

  const mutateSeen = () => {
    startTransition(async () => {
      await fetch("/api/user/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, seen: !seen }),
      });

      setSeen((current) => !current);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant={onWatchlist ? "primary" : "secondary"} disabled={isPending} onClick={mutateWatchlist}>
        {onWatchlist ? "On watchlist" : "Add to watchlist"}
      </Button>
      <Button variant={seen ? "primary" : "secondary"} disabled={isPending} onClick={mutateSeen}>
        {seen ? "Seen" : "Mark as seen"}
      </Button>
    </div>
  );
};

