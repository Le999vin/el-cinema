import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const Select = ({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }) => (
  <div className="relative">
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] pl-4 pr-10 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--accent-soft)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={14}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
    />
  </div>
);
