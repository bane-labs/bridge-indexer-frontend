import { Card, CardContent, Skeleton } from "@atlas/ui";

/** Loading skeleton for the bridge history page. */
export function BridgeHistorySkeleton() {
  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="mb-1.5 flex items-center gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Sync summary cards — 2-column grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="space-y-4">
              {/* Direction heading + status badge */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {/* Comparison grid rows: Nonce, Root, Block */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History tables — one per direction */}
      {[0, 1].map((i) => (
        <div key={i} className="space-y-4">
          <div>
            <Skeleton className="mb-1 h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Card>
            <CardContent className="space-y-3 p-0">
              {/* Table header: Nonce, Status, Amount, Root, Source Tx, Dest Tx, Settled */}
              <div className="bg-muted/50 flex gap-4 px-4 py-3">
                <Skeleton className="h-4 w-[8%]" />
                <Skeleton className="h-4 w-[10%]" />
                <Skeleton className="h-4 w-[8%]" />
                <Skeleton className="h-4 w-[18%]" />
                <Skeleton className="h-4 w-[18%]" />
                <Skeleton className="h-4 w-[18%]" />
                <Skeleton className="h-4 w-[12%]" />
              </div>
              {/* Row skeletons */}
              {Array.from({ length: 5 }, (_, j) => (
                <div key={j} className="flex gap-4 px-4 py-2">
                  <Skeleton className="h-4 w-[8%]" />
                  <Skeleton className="h-5 w-[10%]" />
                  <Skeleton className="h-4 w-[8%]" />
                  <Skeleton className="h-4 w-[18%]" />
                  <Skeleton className="h-4 w-[18%]" />
                  <Skeleton className="h-4 w-[18%]" />
                  <Skeleton className="h-4 w-[12%]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
