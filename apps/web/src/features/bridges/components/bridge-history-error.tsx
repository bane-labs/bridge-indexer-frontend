import Link from "next/link";

import { Card, CardContent } from "@atlas/ui";

/** Error state for the bridge history page. */
export function BridgeHistoryError() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-destructive text-sm font-medium">Failed to load bridge history.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Please try again later or check the backend service.
        </p>
        <Link
          href="/bridges"
          className="text-muted-foreground hover:text-foreground mt-4 inline-block text-sm underline-offset-4 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </CardContent>
    </Card>
  );
}
