import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ShowtimesLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-[160px]" />
          <Skeleton className="h-11 min-w-[200px] flex-1" />
          <Skeleton className="h-11 min-w-[200px] flex-1" />
          <Skeleton className="h-11 w-[110px]" />
          <Skeleton className="h-11 w-[110px]" />
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-[color:var(--border-subtle)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
