import type { LucideIcon } from "lucide-react";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    {Icon && <Icon size={40} className="text-[color:var(--text-muted)] opacity-50" />}
    <p className="text-base font-semibold text-[color:var(--text-primary)]">{title}</p>
    {description && (
      <p className="max-w-[280px] text-sm text-[color:var(--text-muted)]">{description}</p>
    )}
    {action}
  </div>
);
