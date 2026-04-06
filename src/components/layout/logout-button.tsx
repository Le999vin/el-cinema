"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

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
    <Button variant="ghost" className="w-full justify-start gap-3" disabled={isPending} onClick={onLogout}>
      <LogOut size={18} className="shrink-0" />
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
};

