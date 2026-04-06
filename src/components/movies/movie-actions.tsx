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
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mutateWatchlist = () => {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/user/watchlist", {
        method: onWatchlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });

      if (!response.ok) {
        setMessage("Could not update watchlist.");
        return;
      }

      setOnWatchlist((current) => !current);
      setMessage(onWatchlist ? "Removed from your watchlist." : "Added to your watchlist.");
      router.refresh();
    });
  };

  const mutateSeen = () => {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/user/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, seen: !seen }),
      });

      if (!response.ok) {
        setMessage("Could not update seen status.");
        return;
      }

      setSeen((current) => !current);
      setMessage(seen ? "Marked as unseen." : "Marked as seen.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button variant={onWatchlist ? "primary" : "secondary"} disabled={isPending} onClick={mutateWatchlist}>
          {onWatchlist ? "On watchlist" : "Add to watchlist"}
        </Button>
        <Button variant={seen ? "primary" : "secondary"} disabled={isPending} onClick={mutateSeen}>
          {seen ? "Seen" : "Mark as seen"}
        </Button>
      </div>
      <p aria-live="polite" className="text-sm text-[color:var(--text-muted)]">
        {message ?? ""}
      </p>
    </div>
  );
};
