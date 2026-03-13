"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/logout-button";
import { Badge } from "@/components/ui/badge";
import { LOWER_NAV_ITEMS, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col border-r border-[color:var(--border-subtle)] bg-[color:var(--sidebar)] px-6 py-8">
      <div>
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--accent)]">CinemaScope</p>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Swiss cinema catalog</p>
        <div className="mt-4">
          <Badge>Switzerland DB-first</Badge>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
                  : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)] hover:text-[color:var(--text-primary)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-[color:var(--border-subtle)] pt-6">
        {LOWER_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[color:var(--panel)] text-[color:var(--text-primary)]"
                  : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel-soft)] hover:text-[color:var(--text-primary)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <LogoutButton />
      </div>
    </aside>
  );
};
