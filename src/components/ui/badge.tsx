import { cn } from "@/lib/utils";

export const Badge = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-soft)]",
      className,
    )}
  >
    {children}
  </span>
);

