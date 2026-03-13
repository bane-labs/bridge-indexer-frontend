import { Card, CardContent } from "@atlas/ui";

export function BridgeHistoryNotFound() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-foreground text-sm font-medium">Bridge not found.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          The requested bridge does not exist or has no recorded history.
        </p>
      </CardContent>
    </Card>
  );
}
