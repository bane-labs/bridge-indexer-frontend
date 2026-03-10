import { Card, CardContent } from "@atlas/ui";

import { relativeTime } from "../lib/formatters";

import type { BridgeDashboardSummary as SummaryData } from "../types/bridge";

interface BridgeDashboardSummaryProps {
  summary: SummaryData;
}

interface CounterProps {
  label: string;
  value: number;
  className?: string;
}

function Counter({ label, value, className }: CounterProps) {
  return (
    <div className={className}>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

export function BridgeDashboardSummary({ summary }: BridgeDashboardSummaryProps) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex flex-wrap items-center gap-6">
        <Counter label="Total Bridges" value={summary.total} />
        <div className="bg-border h-8 w-px" aria-hidden="true" />
        <Counter label="Synced" value={summary.synced} className="text-success-text" />
        <Counter label="Out of Sync" value={summary.outOfSync} className="text-destructive-text" />
        <Counter label="Stale" value={summary.stale} className="text-warning-text" />
        <Counter label="Syncing" value={summary.syncing} className="text-info-text" />
        {summary.unknown > 0 && <Counter label="Unknown" value={summary.unknown} />}
        <div className="text-muted-foreground ml-auto text-xs" title={summary.lastRefreshedAt}>
          Last refresh: {relativeTime(summary.lastRefreshedAt)}
        </div>
      </CardContent>
    </Card>
  );
}
