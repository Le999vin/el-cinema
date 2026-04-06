import { Skeleton, SkeletonMovieCard } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MoviesLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonMovieCard key={i} />
        ))}
      </div>
    </div>
  );
}
