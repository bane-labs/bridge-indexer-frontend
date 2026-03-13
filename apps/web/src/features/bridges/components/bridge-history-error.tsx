import { Card, CardContent } from "@atlas/ui";

export function BridgeHistoryError() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-destructive text-sm font-medium">Failed to load bridge history.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Please try again later or check the backend service.
        </p>
      </CardContent>
    </Card>
  );
}
