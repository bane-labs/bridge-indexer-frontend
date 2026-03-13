import { Card, CardContent } from "@atlas/ui";

interface BridgeHistoryEmptyStateProps {
  /** Direction label, e.g. "Neo N3 → Neo X". */
  direction: string;
}

/** Empty state shown when a direction has no recorded operations. */
export function BridgeHistoryEmptyState({ direction }: BridgeHistoryEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground text-sm">
          No operations recorded for <span className="font-medium">{direction}</span>.
        </p>
      </CardContent>
    </Card>
  );
}
