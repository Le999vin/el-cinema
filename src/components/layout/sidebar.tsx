"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/logout-button";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, type ShellNavItem } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const isActivePath = (pathname: string, href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

const initialsFromName = (displayName?: string | null) => (displayName ?? "Guest").slice(0, 1).toUpperCase();

const navLinkClassName = (active: boolean) =>
  cn(
    "group flex items-center justify-between gap-3 rounded-[22px] px-4 py-3 text-sm transition-all duration-200 ease-out",
    active
      ? "bg-[color:var(--panel-strong)] text-[color:var(--text-primary)] shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
      : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)]/85 hover:text-[color:var(--text-primary)] hover:translate-x-1",
  );

const SidebarLink = ({ item, pathname }: { item: ShellNavItem; pathname: string }) => {
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={navLinkClassName(active)}>
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent transition-colors",
            active
              ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
              : "bg-black/15 text-[color:var(--accent-soft)] group-hover:border-[color:var(--border-subtle)] group-hover:bg-black/20",
          )}
        >
          <Icon size={18} />
        </span>
        <span className="leading-none">{item.label}</span>
      </span>
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full border border-[color:var(--border-subtle)] transition-all",
          active ? "scale-100 bg-[color:var(--accent-soft)]" : "scale-75 bg-transparent opacity-40 group-hover:opacity-100",
        )}
      />
    </Link>
  );
};

export const Sidebar = ({ displayName }: { displayName?: string | null }) => {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[304px] shrink-0 overflow-hidden border-r border-[color:var(--border-subtle)] bg-[color:var(--sidebar)]/92 lg:flex">
      <div className="relative flex h-full w-full flex-col overflow-y-auto px-6 py-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(212,162,75,0.16),_transparent_65%)]" />

        <div className="relative space-y-5">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[color:var(--accent-soft)]">Cinema desk</p>
            <Link href="/" className="inline-block font-[family-name:var(--font-display)] text-[2.25rem] leading-none text-[color:var(--text-primary)]">
              CinemaScope
            </Link>
            <p className="max-w-[16rem] text-sm leading-6 text-[color:var(--text-muted)]">
              Zurich-first discovery with calmer routing between venues, films, and tonight&apos;s next screening.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Swiss catalog</Badge>
            <Badge className="bg-black/15 text-[color:var(--text-secondary)]">Curated shell</Badge>
          </div>
        </div>

        <div className="relative mt-8 rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--panel)]/80 p-3 shadow-[0_22px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Explore</p>
            <span className="text-xs text-[color:var(--text-muted)]">{PRIMARY_NAV_ITEMS.length} routes</span>
          </div>
          <nav className="space-y-1.5">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <SidebarLink key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>

        <div className="relative mt-auto space-y-4 pt-6">
          <div className="rounded-[30px] border border-[color:var(--border-subtle)] bg-[linear-gradient(160deg,_rgba(212,162,75,0.12),_rgba(23,20,21,0.96))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/25 font-semibold text-[color:var(--accent-soft)]">
                {initialsFromName(displayName)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                  {displayName ? "Signed in" : "Guest mode"}
                </p>
                <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">{displayName ?? "Browse the Zurich selection"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--panel)]/72 p-3 backdrop-blur-xl">
            <div className="mb-3 px-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Account</p>
            </div>
            <div className="space-y-1.5">
              {SECONDARY_NAV_ITEMS.map((item) => (
                <SidebarLink key={item.href} item={item} pathname={pathname} />
              ))}
              {displayName ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm text-[color:var(--text-secondary)] transition-all duration-200 ease-out hover:bg-[color:var(--panel-soft)]/85 hover:text-[color:var(--text-primary)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/15 text-[color:var(--accent-soft)]">
                    <LogIn size={18} />
                  </span>
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
