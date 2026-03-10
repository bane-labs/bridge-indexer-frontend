import { Card, CardContent, Skeleton } from "@atlas/ui";

function SkeletonCard() {
  return (
    <Card className="gap-4">
      <div className="space-y-2 px-6 pt-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="border-border border-t" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
      <div className="flex items-center justify-between px-6 pb-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </Card>
  );
}

export function BridgeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Summary skeleton */}
      <Card className="gap-0 py-4">
        <CardContent className="flex flex-wrap items-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Group skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      ))}
    </div>
  );
}
