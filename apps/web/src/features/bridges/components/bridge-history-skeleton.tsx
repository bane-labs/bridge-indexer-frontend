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

      {/* Sync summary cards — full width, one per direction */}
      <div className="grid gap-4">
        {[0, 1].map((i) => (
          <Card key={i} className="gap-0">
            <CardContent className="space-y-4">
              {/* Direction heading + status badge */}
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {/* Description lines */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              {/* Comparison table */}
              <div className="border-border overflow-hidden rounded-md border">
                {/* Column headers */}
                <div className="bg-muted/40 border-border grid grid-cols-[1fr_auto_1fr] items-center border-b px-4 py-2.5">
                  <Skeleton className="h-3.5 w-16" />
                  <div className="flex w-36 justify-center">
                    <Skeleton className="h-3 w-6" />
                  </div>
                  <Skeleton className="ml-auto h-3.5 w-16" />
                </div>
                {/* Nonce row */}
                <div className="border-border/50 grid grid-cols-[1fr_auto_1fr] items-center border-b px-4 py-4">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex w-36 flex-col items-center gap-1.5">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                {/* State root row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                  <div className="flex w-36 flex-col items-center gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="ml-auto h-4 w-28" />
                </div>
              </div>
              {/* Footer: block + indexed timestamps */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-24" />
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
