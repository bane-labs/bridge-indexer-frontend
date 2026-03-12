import { Card, CardContent } from "@atlas/ui";

export function BridgeStateError() {
  return (
    <Card className="border-destructive/30">
      <CardContent className="py-12 text-center">
        <p className="text-destructive-text text-lg font-semibold">
          Failed to load bridge state data
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Unable to fetch the current bridge sync state. Please try again later.
        </p>
      </CardContent>
    </Card>
  );
}
