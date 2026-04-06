"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bookmark,
  Calendar,
  Film,
  Home,
  LayoutDashboard,
  MapPin,
  Menu,
  Settings,
  Sparkles,
  Tv,
  User,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { Badge } from "@/components/ui/badge";
import { NAV_ITEMS, LOWER_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  MapPin,
  Film,
  Tv,
  Calendar,
  Sparkles,
  LayoutDashboard,
  Bookmark,
  User,
  Settings,
};

export const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--sidebar)] text-[color:var(--text-secondary)] lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[280px] shrink-0 flex-col border-r border-[color:var(--border-subtle)] bg-[color:var(--sidebar)] px-6 py-8 transition-transform lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--accent)]">
            CinemaScope
          </p>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">Swiss cinema catalog</p>
          <div className="mt-4">
            <Badge>Switzerland DB-first</Badge>
          </div>
        </div>

        <nav className="mt-10 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = ICON_MAP[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                    : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)] hover:text-[color:var(--text-primary)]",
                )}
              >
                {Icon && <Icon size={18} className="shrink-0" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-[color:var(--border-subtle)] pt-6">
          {LOWER_NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = ICON_MAP[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[color:var(--panel)] text-[color:var(--text-primary)]"
                    : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)] hover:text-[color:var(--text-primary)]",
                )}
              >
                {Icon && <Icon size={18} className="shrink-0" />}
                {item.label}
              </Link>
            );
          })}
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};
