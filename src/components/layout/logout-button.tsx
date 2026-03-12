"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onLogout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <Button variant="ghost" className="w-full justify-start" disabled={isPending} onClick={onLogout}>
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
};

