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
      "inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)]/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm",
      className,
    )}
  >
    {children}
  </span>
);
