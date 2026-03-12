"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Home", subtitle: "Tonight's best cinema options in Zurich" },
  "/cinemas": { title: "Cinemas", subtitle: "Premium venues and independent gems" },
  "/movies": { title: "Movies", subtitle: "Discover what is showing and what is next" },
  "/showtimes": { title: "Showtimes", subtitle: "Find the screening that fits your evening" },
  "/recommendations": { title: "Recommendations", subtitle: "Personal picks tuned to your taste" },
  "/dashboard": { title: "Dashboard", subtitle: "Your cinema profile, ratings, and habits" },
  "/watchlist": { title: "Watchlist", subtitle: "Movies you want to catch soon" },
  "/profile": { title: "Profile", subtitle: "Identity and account details" },
  "/settings": { title: "Settings", subtitle: "Preferences that shape recommendations" },
};

export const TopBar = ({ displayName }: { displayName?: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const meta = useMemo(() => {
    const exact = pageMeta[pathname];
    if (exact) {
      return exact;
    }

    if (pathname.startsWith("/cinemas/")) {
      return { title: "Cinema Details", subtitle: "Venue profile and showtimes" };
    }

    if (pathname.startsWith("/movies/")) {
      return { title: "Movie Details", subtitle: "Context, screenings, and actions" };
    }

    if (pathname.startsWith("/admin")) {
      return { title: "Admin", subtitle: "Manage internal showtimes" };
    }

    return { title: "CinemaScope", subtitle: "Zurich-first discovery" };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/95 px-10 py-6 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[color:var(--text-primary)]">
            {meta.title}
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget as HTMLFormElement;
              const input = form.elements.namedItem("query") as HTMLInputElement;
              const params = new URLSearchParams(searchParams.toString());
              if (input.value.trim()) {
                params.set("search", input.value.trim());
              } else {
                params.delete("search");
              }
              router.push(`/movies?${params.toString()}`);
            }}
            className="w-[280px]"
          >
            <Input name="query" placeholder="Search movies or cinemas" />
          </form>
          <Badge>Zurich</Badge>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--panel-soft)] text-sm font-semibold text-[color:var(--accent)]">
            {(displayName ?? "U").slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

