import { cn } from "@/lib/utils";

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
      className,
    )}
  >
    {children}
  </section>
);

