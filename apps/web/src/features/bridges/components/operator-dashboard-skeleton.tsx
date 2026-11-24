import { Card, CardContent, Skeleton } from "@atlas/ui";

/**
 * Loading skeleton for the operator dashboard.
 * Matches the layout: summary strip → attention section → filters → table.
 */
export function OperatorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1">
            {/* Total */}
            <div className="flex flex-col items-center gap-0.5 px-3">
              <Skeleton className="h-7 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
            {/* Divider */}
            <div className="bg-border mx-1 h-8 w-px" aria-hidden="true" />
            {/* Synced, Pending, Delayed */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 px-3">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-56" />
        {/* Status pills: All, Synced, Pending, Delayed, Indexer Lagging */}
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-lg" />
          ))}
        </div>
        {/* Direction pills: All, N3→X, X→N3 */}
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-lg" />
          ))}
        </div>
        {/* Type pills: All, Native, Message, Token */}
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-lg border shadow-sm">
        {/* Table header: Status, Direction, Asset, Type, Src Nonce, Dst Nonce, Lag, Updated */}
        <div className="bg-muted/40 px-4 py-3">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-t px-4 py-3">
            <div className="flex items-center gap-8">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
