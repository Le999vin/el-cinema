"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Home", subtitle: "Tonight's best cinema options in Zurich" },
  "/cinemas": { title: "Cinemas", subtitle: "Swiss cinema venues indexed from the local catalog" },
  "/movies": { title: "Movies", subtitle: "Discover what is showing and what is next" },
  "/series": { title: "Series", subtitle: "Track what is streaming and what to start next" },
  "/showtimes": { title: "Showtimes", subtitle: "Find the screening that fits your evening" },
  "/recommendations": { title: "Recommendations", subtitle: "Personal picks tuned to your taste" },
  "/dashboard": { title: "Dashboard", subtitle: "Your cinema profile, ratings, and habits" },
  "/watchlist": { title: "Watchlist", subtitle: "Movies you want to catch soon" },
  "/profile": { title: "Profile", subtitle: "Identity and account details" },
  "/settings": { title: "Settings", subtitle: "Preferences that shape recommendations" },
};

const SEARCHABLE_PREFIXES = ["/movies", "/series", "/cinemas"];

export const TopBar = ({ displayName }: { displayName?: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchTarget = pathname.startsWith("/series")
    ? "/series"
    : pathname.startsWith("/cinemas")
      ? "/cinemas"
      : "/movies";
  const searchPlaceholder = pathname.startsWith("/series")
    ? "Search series"
    : pathname.startsWith("/cinemas")
      ? "Search cinemas"
      : "Search movies";
  const locationBadge = pathname.startsWith("/cinemas") ? "Switzerland" : "Zurich";
  const showSearch = SEARCHABLE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [inputValue, setInputValue] = useState(searchParams.get("search") ?? "");

  const meta = useMemo(() => {
    const exact = pageMeta[pathname];
    if (exact) return exact;
    if (pathname.startsWith("/cinemas/")) return { title: "Cinema Details", subtitle: "Swiss venue profile, map, and local showtimes" };
    if (pathname.startsWith("/movies/")) return { title: "Movie Details", subtitle: "Context, screenings, and actions" };
    if (pathname.startsWith("/series/")) return { title: "Series Details", subtitle: "Overview, seasons, and discovery context" };
    if (pathname.startsWith("/admin")) return { title: "Admin", subtitle: "Manage internal showtimes" };
    return { title: "CinemaScope", subtitle: "Zurich-first discovery" };
  }, [pathname]);

  const pushSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    router.push(`${searchTarget}?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(value), 400);
  };

  const handleClear = () => {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch("");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--border-subtle)] bg-[color:var(--background)]/95 px-4 py-6 backdrop-blur-sm lg:px-10">
      <div className="flex items-center justify-between gap-6">
        <div className="pl-12 lg:pl-0">
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-[color:var(--text-primary)]">
            {meta.title}
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">{meta.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative w-[200px] lg:w-[280px]">
              <input
                value={inputValue}
                onChange={handleChange}
                placeholder={searchPlaceholder}
                className={`h-11 w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-soft)] focus:outline-none ${inputValue ? "pr-9" : ""}`}
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          <Badge>{locationBadge}</Badge>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--panel-soft)] text-sm font-semibold text-[color:var(--accent)]">
            {(displayName ?? "U").slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
