import { Badge } from "@atlas/ui";

import { getIndexerStatusLabel, getOperationStatusLabel } from "../lib/formatters";

import type { IndexerStatus, OperationStatus } from "../types/bridge";

// ─── Operation Status Badge ────────────────────────────────────────────────
// Shows relay progress: has the bridge delivered the operation?

const OPERATION_CONFIG: Record<
  OperationStatus,
  { variant: "success" | "destructive" | "warning" | "info" | "secondary"; icon: string }
> = {
  synced: { variant: "success", icon: "●" },
  pending: { variant: "info", icon: "↻" },
  delayed: { variant: "destructive", icon: "✕" },
};

interface OperationStatusBadgeProps {
  status: OperationStatus;
  className?: string;
}

export function OperationStatusBadge({ status, className }: OperationStatusBadgeProps) {
  const config = OPERATION_CONFIG[status];
  const label = getOperationStatusLabel(status);

  return (
    <Badge variant={config.variant} className={className} aria-label={`Operation: ${label}`}>
      <span aria-hidden="true">{config.icon}</span>
      {label}
    </Badge>
  );
}

// ─── Indexer Status Badge ──────────────────────────────────────────────────
// Shows data freshness: can we trust the data we're seeing?

const INDEXER_CONFIG: Record<
  IndexerStatus,
  { variant: "success" | "destructive" | "warning" | "info" | "secondary"; icon: string }
> = {
  fresh: { variant: "success", icon: "●" },
  lagging: { variant: "warning", icon: "◌" },
  unknown: { variant: "secondary", icon: "?" },
};

interface IndexerStatusBadgeProps {
  status: IndexerStatus;
  className?: string;
}

export function IndexerStatusBadge({ status, className }: IndexerStatusBadgeProps) {
  const config = INDEXER_CONFIG[status];
  const label = getIndexerStatusLabel(status);

  return (
    <Badge variant={config.variant} className={className} aria-label={`Indexer: ${label}`}>
      <span aria-hidden="true">{config.icon}</span>
      {label}
    </Badge>
  );
}

// ─── Legacy re-export ──────────────────────────────────────────────────────
// Kept so existing imports compile during migration; prefer OperationStatusBadge.
export { OperationStatusBadge as SyncStatusBadge };
