import { Card, CardContent, Skeleton } from "@atlas/ui";

export function BridgeHistorySkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((i) => (
        <Card key={i}>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="space-y-3 pt-2">
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
