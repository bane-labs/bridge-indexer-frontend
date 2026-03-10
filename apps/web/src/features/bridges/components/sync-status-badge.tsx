import { Badge } from "@atlas/ui";

import { getSyncStatusLabel } from "../lib/formatters";

import type { SyncStatus } from "../types/bridge";

const STATUS_CONFIG: Record<
  SyncStatus,
  { variant: "success" | "destructive" | "warning" | "info" | "secondary"; icon: string }
> = {
  synced: { variant: "success", icon: "●" },
  out_of_sync: { variant: "destructive", icon: "✕" },
  syncing: { variant: "info", icon: "↻" },
  stale: { variant: "warning", icon: "◌" },
  unknown: { variant: "secondary", icon: "?" },
};

interface SyncStatusBadgeProps {
  status: SyncStatus;
  className?: string;
}

export function SyncStatusBadge({ status, className }: SyncStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const label = getSyncStatusLabel(status);

  return (
    <Badge variant={config.variant} className={className} aria-label={`Status: ${label}`}>
      <span aria-hidden="true">{config.icon}</span>
      {label}
    </Badge>
  );
}
