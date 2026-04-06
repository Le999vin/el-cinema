import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-[color:var(--panel-soft)]", className)} />
);

export const SkeletonMovieCard = () => (
  <div className="overflow-hidden rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)]">
    <div className="h-72 w-full animate-pulse bg-[color:var(--panel-soft)]" />
    <div className="flex flex-wrap gap-2 p-4">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-14 rounded-full" />
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <Card className="flex items-start justify-between">
    <div className="space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-12" />
    </div>
    <Skeleton className="h-10 w-10 rounded-xl" />
  </Card>
);
