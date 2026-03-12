"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setError(null);
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: formData.get("email"),
              password: formData.get("password"),
            }),
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: { message?: string } };
            setError(payload.error?.message ?? "Login failed.");
            return;
          }

          router.push("/dashboard");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--text-primary)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Sign in to continue with your personalised cinema plan.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Email</span>
        <Input name="email" type="email" autoComplete="email" required />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Password</span>
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-[color:var(--text-muted)]">
        No account yet? <a href="/register" className="text-[color:var(--accent-soft)]">Create one</a>
      </p>
    </form>
  );
};

