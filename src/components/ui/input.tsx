import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-11 w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] px-4 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-soft)] focus:outline-none",
      className,
    )}
    {...props}
  />
);

