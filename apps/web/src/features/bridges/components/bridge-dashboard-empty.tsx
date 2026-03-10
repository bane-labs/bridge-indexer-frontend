import { Card, CardContent } from "@atlas/ui";

export function BridgeDashboardEmpty() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-foreground text-lg font-semibold">No bridges configured</p>
        <p className="text-muted-foreground mt-1 text-sm">
          There are no bridge instances being monitored yet.
        </p>
      </CardContent>
    </Card>
  );
}
