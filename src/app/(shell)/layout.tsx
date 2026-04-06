import { Suspense } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await resolveCurrentUser();

  return (
    <div className="flex min-h-screen overflow-x-clip bg-[color:var(--background)]">
      <Sidebar displayName={user?.displayName ?? null} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Suspense
          fallback={
            <header className="px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
              <div className="rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--background-elevated)]/82 px-6 py-5 backdrop-blur-xl">
              <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>
              </div>
            </header>
          }
        >
          <TopBar displayName={user?.displayName ?? null} />
        </Suspense>
        <main id="main-content" className="flex-1 px-3 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pb-12 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
