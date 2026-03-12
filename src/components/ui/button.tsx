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
      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
      variant === "primary" &&
        "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:bg-[color:var(--accent-strong)]",
      variant === "secondary" &&
        "border border-[color:var(--border-subtle)] bg-[color:var(--panel-soft)] text-[color:var(--text-primary)] hover:border-[color:var(--accent-soft)]",
      variant === "ghost" && "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

