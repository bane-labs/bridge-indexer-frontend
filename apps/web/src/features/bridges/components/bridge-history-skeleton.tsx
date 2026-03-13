import { Card, CardContent, Skeleton } from "@atlas/ui";

/** Loading skeleton for the bridge history page. */
export function BridgeHistorySkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="mb-1.5 h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="space-y-4">
          <div>
            <Skeleton className="mb-1 h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Card>
            <CardContent className="space-y-3 p-0">
              {/* Table header skeleton */}
              <div className="bg-muted/50 flex gap-4 px-4 py-3">
                {[20, 24, 32, 32, 24].map((w, j) => (
                  <Skeleton key={j} className="h-4" style={{ width: `${w}%` }} />
                ))}
              </div>
              {/* Row skeletons */}
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="flex gap-4 px-4 py-2">
                  <Skeleton className="h-4 w-[20%]" />
                  <Skeleton className="h-4 w-[24%]" />
                  <Skeleton className="h-4 w-[32%]" />
                  <Skeleton className="h-4 w-[32%]" />
                  <Skeleton className="h-4 w-[24%]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
