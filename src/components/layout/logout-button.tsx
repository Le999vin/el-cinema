"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export const LogoutButton = ({ onLoggedOut }: { onLoggedOut?: () => void } = {}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onLogout = () => {
    startTransition(async () => {
      setError(null);
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("Logout failed. Please try again.");
        return;
      }

      onLoggedOut?.();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button variant="ghost" className="w-full justify-start" disabled={isPending} onClick={onLogout}>
        {isPending ? "Logging out..." : "Logout"}
      </Button>
      <p aria-live="polite" className="text-xs text-rose-300">
        {error ?? ""}
      </p>
    </div>
  );
};
