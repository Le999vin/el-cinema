import { Suspense } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await resolveCurrentUser();

  return (
    <div className="flex min-h-screen bg-[color:var(--background)]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Suspense
          fallback={
            <header className="border-b border-[color:var(--border-subtle)] px-10 py-6">
              <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>
            </header>
          }
        >
          <TopBar displayName={user?.displayName ?? null} />
        </Suspense>
        <main className="flex-1 px-10 py-8">{children}</main>
      </div>
    </div>
  );
}

