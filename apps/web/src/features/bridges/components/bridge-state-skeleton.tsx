import { Card, CardContent, Skeleton } from "@atlas/ui";

function SkeletonSyncCard() {
  return (
    <Card className="gap-3">
      <div className="space-y-2 px-6 pt-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-5 w-40" />
      </div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="border-border border-t" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <div className="flex items-center justify-between px-6 pb-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
}

export function BridgeStateSkeleton() {
  return (
    <div className="space-y-8">
      {/* Filter skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-60" />
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>
      </div>

      {/* Section skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonSyncCard />
            <SkeletonSyncCard />
          </div>
        </section>
      ))}
    </div>
  );
}
