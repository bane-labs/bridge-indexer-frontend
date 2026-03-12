import { Card, CardContent } from "@atlas/ui";

export function BridgeStateNoResults() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-foreground text-lg font-semibold">No matching bridges</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your search or filter criteria.
        </p>
      </CardContent>
    </Card>
  );
}
