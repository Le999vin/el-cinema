import { Suspense } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ToastProvider } from "@/components/ui/toast-provider";
import { resolveCurrentUser } from "@/services/auth/auth-service";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await resolveCurrentUser();

  return (
    <div className="flex min-h-screen bg-[color:var(--background)]">
      <Sidebar />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <Suspense fallback={<header className="h-[88px] border-b border-[color:var(--border-subtle)]" />}>
          <TopBar displayName={user?.displayName ?? null} />
        </Suspense>
        <ToastProvider>
          <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8">{children}</main>
        </ToastProvider>
      </div>
    </div>
  );
}

