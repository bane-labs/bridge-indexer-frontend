import { Badge } from "@atlas/ui";

interface StaleIndicatorProps {
  reason?: string;
  className?: string;
}

export function StaleIndicator({ reason, className }: StaleIndicatorProps) {
  return (
    <span className={className} role="status" aria-label={`Stale: ${reason ?? "data is outdated"}`}>
      <Badge variant="warning" size="sm">
        <span aria-hidden="true">⚠</span> Stale
      </Badge>
      {reason && <span className="text-warning-text ml-2 text-xs">{reason}</span>}
    </span>
  );
}
