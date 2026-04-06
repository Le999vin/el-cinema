"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-provider";

interface MovieActionsProps {
  movieId: string;
  initialWatchlist: boolean;
  initialSeen: boolean;
}

export const MovieActions = ({ movieId, initialWatchlist, initialSeen }: MovieActionsProps) => {
  const router = useRouter();
  const { toast } = useToast();
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
      const next = !onWatchlist;
      setOnWatchlist(next);
      toast(next ? "Added to watchlist" : "Removed from watchlist", "success");
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
      const next = !seen;
      setSeen(next);
      toast(next ? "Marked as seen" : "Removed from seen", "success");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant={onWatchlist ? "primary" : "secondary"} disabled={isPending} onClick={mutateWatchlist} className="gap-2">
        {isPending ? <Spinner className="h-4 w-4" /> : <Bookmark size={16} fill={onWatchlist ? "currentColor" : "none"} />}
        {onWatchlist ? "On watchlist" : "Add to watchlist"}
      </Button>
      <Button variant={seen ? "primary" : "secondary"} disabled={isPending} onClick={mutateSeen} className="gap-2">
        {isPending ? <Spinner className="h-4 w-4" /> : <Eye size={16} />}
        {seen ? "Seen" : "Mark as seen"}
      </Button>
    </div>
  );
};
