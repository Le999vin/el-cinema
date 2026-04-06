import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-12 w-full rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)]/82 px-4 text-sm text-[color:var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-soft)] focus:bg-[color:var(--panel-strong)] focus:outline-none",
      className,
    )}
    {...props}
  />
);
