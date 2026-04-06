import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function RecommendationsLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-3 h-12 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      </Card>

      <Card>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-56" />
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
