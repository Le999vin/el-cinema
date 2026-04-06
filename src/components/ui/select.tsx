import { cn } from "@/lib/utils";

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={cn(
      "h-11 w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-soft)] focus:outline-none",
      className,
    )}
    {...props}
  >
    {children}
  </select>
);
