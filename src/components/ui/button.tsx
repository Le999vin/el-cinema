import { cn } from "@/lib/utils";

export const Button = ({
  className,
  children,
  type = "button",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" &&
        "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_14px_34px_rgba(212,162,75,0.18)] hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]",
      variant === "secondary" &&
        "border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)]/85 text-[color:var(--text-primary)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-[color:var(--accent-soft)] hover:bg-[color:var(--panel-strong)]",
      variant === "ghost" &&
        "text-[color:var(--text-secondary)] hover:-translate-y-0.5 hover:bg-[color:var(--panel-soft)]/75 hover:text-[color:var(--text-primary)]",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
