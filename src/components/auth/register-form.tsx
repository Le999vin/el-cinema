"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const password = formData.get("password")?.toString() ?? "";
        const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        startTransition(async () => {
          setError(null);
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: formData.get("displayName"),
              email: formData.get("email"),
              password,
            }),
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: { message?: string } };
            setError(payload.error?.message ?? "Registration failed.");
            return;
          }

          router.push("/onboarding");
          router.refresh();
        });
      }}
    >
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--text-primary)]">Create account</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Set up your profile and start receiving better showtime suggestions.</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Display name</span>
        <Input name="displayName" autoComplete="name" required />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Email</span>
        <Input name="email" type="email" autoComplete="email" required />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Password</span>
        <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-[color:var(--text-secondary)]">Confirm password</span>
        <Input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </label>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-[color:var(--text-muted)]">
        Already registered? <a href="/login" className="text-[color:var(--accent-soft)]">Sign in</a>
      </p>
    </form>
  );
};

