import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bookmark, CheckCircle, Film } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { MovieSummary } from "@/domain/types";

interface MovieCardProps {
  movie: MovieSummary;
  onWatchlist?: boolean;
  seen?: boolean;
}

export const MovieCard = ({ movie, onWatchlist, seen }: MovieCardProps) => (
  <Card className="group overflow-hidden p-0 transition-transform hover:scale-[1.02] hover:shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
    <div className="relative h-72 w-full bg-[color:var(--panel-soft)]">
      {movie.posterUrl ? (
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Film size={40} className="text-[color:var(--text-muted)] opacity-30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* Watchlist / Seen indicator */}
      {onWatchlist && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
          <Bookmark size={14} fill="currentColor" />
        </div>
      )}
      {!onWatchlist && seen && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700/80 text-white">
          <CheckCircle size={14} />
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-white">
            {movie.title}
          </h3>
          <p className="text-xs text-zinc-300">{movie.releaseDate ?? "TBA"}</p>
        </div>
        <Link
          href={`/movies/${movie.id}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-sm transition hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]"
          aria-label={`Open ${movie.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 p-4">
      {movie.genres.slice(0, 3).map((genre) => (
        <Badge key={genre}>{genre}</Badge>
      ))}
    </div>
  </Card>
);
