"use client";

import { LogIn, MapPin, Menu, SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, type ShellNavItem } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const pageMeta: Record<string, { eyebrow: string; title: string; subtitle: string }> = {
  "/": {
    eyebrow: "Tonight's shortlist",
    title: "Home",
    subtitle: "Plan a smoother cinema night without jumping between tabs.",
  },
  "/cinemas": {
    eyebrow: "Venue directory",
    title: "Cinemas",
    subtitle: "Swiss venues, local context, and the places worth checking first.",
  },
  "/movies": {
    eyebrow: "Catalog",
    title: "Movies",
    subtitle: "Discover what is opening, what is trending, and what deserves a seat.",
  },
  "/series": {
    eyebrow: "Streaming desk",
    title: "Series",
    subtitle: "Track what is on deck when tonight turns into staying in.",
  },
  "/search": {
    eyebrow: "Search across the catalog",
    title: "Search",
    subtitle: "Pull films, venues, and showtimes into one focused result set.",
  },
  "/showtimes": {
    eyebrow: "Timing first",
    title: "Showtimes",
    subtitle: "Find the screening that actually fits the evening you have.",
  },
  "/recommendations": {
    eyebrow: "For your taste",
    title: "Recommendations",
    subtitle: "Personal picks tuned to your watch history and favourite genres.",
  },
  "/dashboard": {
    eyebrow: "Your cinema profile",
    title: "Dashboard",
    subtitle: "Ratings, habits, favourites, and what the app is learning from them.",
  },
  "/watchlist": {
    eyebrow: "Saved for later",
    title: "Watchlist",
    subtitle: "The films you still want to catch before they disappear from the calendar.",
  },
  "/profile": {
    eyebrow: "Account",
    title: "Profile",
    subtitle: "Identity details and personal context for your cinema desk.",
  },
  "/settings": {
    eyebrow: "Preferences",
    title: "Settings",
    subtitle: "Fine-tune the signals that shape recommendations and discovery.",
  },
};

const isActivePath = (pathname: string, href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

const initialsFromName = (displayName?: string | null) => (displayName ?? "Guest").slice(0, 1).toUpperCase();

const drawerLinkClassName = (active: boolean) =>
  cn(
    "group flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm transition-all duration-200 ease-out",
    active
      ? "bg-[color:var(--panel-strong)] text-[color:var(--text-primary)] shadow-[0_16px_40px_rgba(0,0,0,0.24)]"
      : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)]/85 hover:text-[color:var(--text-primary)] hover:translate-x-1",
  );

const DrawerLink = ({
  item,
  pathname,
  onNavigate,
}: {
  item: ShellNavItem;
  pathname: string;
  onNavigate: () => void;
}) => {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate} className={drawerLinkClassName(active)}>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
          active
            ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
            : "bg-black/15 text-[color:var(--accent-soft)] group-hover:bg-black/20",
        )}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1">{item.label}</span>
    </Link>
  );
};

export const TopBar = ({ displayName }: { displayName?: string | null }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const initial = initialsFromName(displayName);
  const locationBadge = pathname.startsWith("/cinemas") || pathname.startsWith("/search") ? "Switzerland" : "Zurich";

  const meta = useMemo(() => {
    const exact = pageMeta[pathname];
    if (exact) {
      return exact;
    }

    if (pathname.startsWith("/cinemas/")) {
      return {
        eyebrow: "Venue focus",
        title: "Cinema Details",
        subtitle: "Swiss venue profile, local map context, and the showtimes nearby.",
      };
    }

    if (pathname.startsWith("/movies/")) {
      return {
        eyebrow: "Film focus",
        title: "Movie Details",
        subtitle: "Context, screenings, and the information needed before you commit.",
      };
    }

    if (pathname.startsWith("/series/")) {
      return {
        eyebrow: "Series focus",
        title: "Series Details",
        subtitle: "Overview, seasons, and the context around what to start next.",
      };
    }

    if (pathname.startsWith("/admin")) {
      return {
        eyebrow: "Operations",
        title: "Admin",
        subtitle: "Manage showtimes and keep the schedule layer current.",
      };
    }

    return {
      eyebrow: "CinemaScope",
      title: "CinemaScope",
      subtitle: "Zurich-first discovery with fewer decisions spread across other tools.",
    };
  }, [pathname]);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 16);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-[30px] border border-[color:var(--border-subtle)] px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition-all duration-300 ease-out sm:px-6 sm:py-5 lg:px-8",
            scrolled ? "bg-[color:var(--background-elevated)]/90" : "bg-[color:var(--background-elevated)]/76",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,162,75,0.15),_transparent_38%),linear-gradient(135deg,_rgba(255,255,255,0.02),_transparent_55%)]" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-11 rounded-full px-0"
                  aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((current) => !current)}
                >
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </Button>
                <Link href="/" className="font-[family-name:var(--font-display)] text-[1.95rem] leading-none text-[color:var(--text-primary)]">
                  CinemaScope
                </Link>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-black/20 text-sm font-semibold text-[color:var(--accent-soft)]">
                {initial}
              </div>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--accent-soft)]">{meta.eyebrow}</p>
                <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="font-[family-name:var(--font-display)] text-[2.35rem] leading-none text-[color:var(--text-primary)] sm:text-[2.8rem]">
                      {meta.title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)] sm:text-[0.95rem]">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:min-w-[420px] xl:max-w-[600px] xl:flex-1 xl:items-end">
                <form
                  className="relative w-full"
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget as HTMLFormElement;
                    const input = form.elements.namedItem("query") as HTMLInputElement;
                    const params = new URLSearchParams();
                    const query = input.value.trim();

                    if (query) {
                      params.set("query", query);
                    }

                    setMenuOpen(false);
                    router.push(params.toString() ? `/search?${params.toString()}` : "/search");
                  }}
                >
                  <label htmlFor="global-search" className="sr-only">
                    Search movies or cinemas
                  </label>
                  <SearchIcon
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
                  />
                  <Input
                    id="global-search"
                    name="query"
                    defaultValue={pathname === "/search" ? searchParams.get("query") ?? "" : ""}
                    placeholder="Search movies or cinemas"
                    className="pl-11"
                  />
                </form>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="gap-1.5">
                    <MapPin size={12} />
                    {locationBadge}
                  </Badge>
                  <div className="hidden items-center gap-3 rounded-full border border-[color:var(--border-subtle)] bg-black/12 px-2 py-2 lg:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-sm font-semibold text-[color:var(--accent-soft)]">
                      {initial}
                    </div>
                    <div className="pr-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                        {displayName ? "Signed in" : "Guest mode"}
                      </p>
                      <p className="max-w-[11rem] truncate text-sm text-[color:var(--text-primary)]">{displayName ?? "Browse freely"}</p>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-black/12 text-sm font-semibold text-[color:var(--accent-soft)] lg:hidden">
                    {initial}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/62 backdrop-blur-md transition duration-300 ease-out lg:hidden",
          menuOpen ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-50 flex w-[min(88vw,360px)] flex-col overflow-hidden rounded-[34px] border border-[color:var(--border-subtle)] bg-[color:var(--sidebar)]/92 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ease-out lg:hidden",
          menuOpen ? "visible translate-x-0 opacity-100" : "invisible -translate-x-[112%] opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,_rgba(212,162,75,0.18),_transparent_70%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--accent-soft)]">Cinema desk</p>
            <Link href="/" onClick={() => setMenuOpen(false)} className="mt-2 inline-block font-[family-name:var(--font-display)] text-4xl leading-none text-[color:var(--text-primary)]">
              CinemaScope
            </Link>
            <p className="mt-3 max-w-[15rem] text-sm leading-6 text-[color:var(--text-muted)]">
              Fewer tabs, better timing, and one place to decide where tonight goes.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-11 rounded-full px-0"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </Button>
        </div>

        <div className="relative mt-6 rounded-[28px] border border-[color:var(--border-subtle)] bg-[linear-gradient(160deg,_rgba(212,162,75,0.12),_rgba(20,18,19,0.96))] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/20 text-sm font-semibold text-[color:var(--accent-soft)]">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                {displayName ? "Signed in" : "Guest mode"}
              </p>
              <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{displayName ?? "Browse the Swiss catalog"}</p>
            </div>
          </div>
        </div>

        <nav className="relative mt-6 space-y-2">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <DrawerLink key={item.href} item={item} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          ))}
        </nav>

        <div className="relative mt-auto space-y-2 border-t border-[color:var(--border-subtle)] pt-6">
          {SECONDARY_NAV_ITEMS.map((item) => (
            <DrawerLink key={item.href} item={item} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          ))}
          {displayName ? (
            <LogoutButton onLoggedOut={() => setMenuOpen(false)} />
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm text-[color:var(--text-secondary)] transition-all duration-200 ease-out hover:bg-[color:var(--panel-soft)]/85 hover:text-[color:var(--text-primary)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/15 text-[color:var(--accent-soft)]">
                <LogIn size={18} />
              </span>
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
