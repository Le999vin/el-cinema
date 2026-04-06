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
      "rounded-[30px] border border-[color:var(--border-subtle)] bg-[color:var(--panel)]/92 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl",
      className,
    )}
  >
    {children}
  </section>
);
