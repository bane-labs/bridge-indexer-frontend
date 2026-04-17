"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@atlas/ui";

import {
  type BridgeInstanceRow,
  getProblematicRows,
  sortBySeverity,
  toBridgeInstanceRows,
} from "../lib/bridge-instance";
import { relativeTime } from "../lib/formatters";

import { SyncStatusBadge } from "./sync-status-badge";

import type { BridgeDashboardSummary, DirectionalBridgeStatus } from "../types/bridge";

// ─── Filter types ─────────────────────────────────────────
type StatusFilter = "all" | "synced" | "out_of_sync" | "syncing" | "stale";
type DirectionFilter = "all" | "neo_n3_to_neo_x" | "neo_x_to_neo_n3";
type TypeFilter = "all" | "native" | "message" | "token";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "synced", label: "Synced" },
  { value: "out_of_sync", label: "Out of Sync" },
  { value: "syncing", label: "Syncing" },
  { value: "stale", label: "Stale" },
];

const DIRECTION_OPTIONS: { value: DirectionFilter; label: string }[] = [
  { value: "all", label: "All directions" },
  { value: "neo_n3_to_neo_x", label: "N3 → X" },
  { value: "neo_x_to_neo_n3", label: "X → N3" },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "native", label: "Native" },
  { value: "message", label: "Message" },
  { value: "token", label: "Token" },
];

// ─── Summary KPI strip ───────────────────────────────────
function KpiCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3">
      <span className={`text-2xl font-semibold tabular-nums ${colorClass ?? "text-foreground"}`}>
        {value}
      </span>
      <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
}

function SummaryStrip({ summary }: { summary: BridgeDashboardSummary }) {
  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-wrap items-center gap-1">
          <KpiCard label="Total" value={summary.total} />
          <div className="bg-border mx-1 h-8 w-px" aria-hidden="true" />
          <KpiCard label="Synced" value={summary.synced} colorClass="text-emerald-500" />
          <KpiCard label="Syncing" value={summary.syncing} colorClass="text-blue-400" />
          <KpiCard label="Out of Sync" value={summary.outOfSync} colorClass="text-red-400" />
          <KpiCard label="Stale" value={summary.stale} colorClass="text-amber-400" />
          {summary.unknown > 0 && <KpiCard label="Unknown" value={summary.unknown} />}
          {summary.pendingOperations !== undefined && summary.pendingOperations > 0 && (
            <>
              <div className="bg-border mx-1 h-8 w-px" aria-hidden="true" />
              <KpiCard
                label="Pending"
                value={summary.pendingOperations}
                colorClass="text-blue-400"
              />
            </>
          )}
          {summary.stuckOperations !== undefined && summary.stuckOperations > 0 && (
            <KpiCard label="Stuck" value={summary.stuckOperations} colorClass="text-red-400" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {summary.healthStatus && <HealthStatusIndicator status={summary.healthStatus} />}
          <span
            className="text-muted-foreground text-xs tabular-nums"
            title={summary.lastRefreshedAt}
          >
            Refreshed {relativeTime(summary.lastRefreshedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthStatusIndicator({ status }: { status: "healthy" | "degraded" | "unhealthy" }) {
  const config = {
    healthy: { label: "Healthy", color: "text-emerald-500", dot: "bg-emerald-500" },
    degraded: { label: "Degraded", color: "text-amber-400", dot: "bg-amber-400" },
    unhealthy: { label: "Unhealthy", color: "text-red-400", dot: "bg-red-400" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

// ─── Needs Attention section ─────────────────────────────
function NeedsAttention({ rows }: { rows: BridgeInstanceRow[] }) {
  if (rows.length === 0) return null;

  return (
    <Card className="border-red-500/20 bg-red-500/3">
      <CardContent className="py-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold text-red-400">⚠ Needs Attention</span>
          <Badge variant="destructive" size="sm">
            {rows.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-background/60 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <SyncStatusBadge status={row.syncStatus} />
                <span className="text-foreground truncate text-sm font-medium">
                  {row.directionLabel}
                </span>
                <span className="text-muted-foreground text-xs">{row.assetLabel}</span>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {row.lag !== 0 && (
                  <span className="text-muted-foreground font-mono text-xs">
                    lag: <span className="font-semibold text-red-400">{Math.abs(row.lag)}</span>
                  </span>
                )}
                <Link
                  href={`/bridges/${row.slug}`}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                >
                  Inspect →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Filter controls ──────────────────────────────────────
function FilterPill<T extends string>({
  value,
  current,
  label,
  onSelect,
}: {
  value: T;
  current: T;
  label: string;
  onSelect: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-transparent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function DashboardFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  directionFilter,
  onDirectionChange,
  typeFilter,
  onTypeChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  directionFilter: DirectionFilter;
  onDirectionChange: (v: DirectionFilter) => void;
  typeFilter: TypeFilter;
  onTypeChange: (v: TypeFilter) => void;
  resultCount: number;
  totalCount: number;
}) {
  const hasFilters =
    search || statusFilter !== "all" || directionFilter !== "all" || typeFilter !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search asset, bridge name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-56"
          aria-label="Search bridges"
        />

        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
          {STATUS_OPTIONS.map((o) => (
            <FilterPill
              key={o.value}
              value={o.value}
              current={statusFilter}
              label={o.label}
              onSelect={onStatusChange}
            />
          ))}
        </div>

        <div className="flex gap-1" role="group" aria-label="Filter by direction">
          {DIRECTION_OPTIONS.map((o) => (
            <FilterPill
              key={o.value}
              value={o.value}
              current={directionFilter}
              label={o.label}
              onSelect={onDirectionChange}
            />
          ))}
        </div>

        <div className="flex gap-1" role="group" aria-label="Filter by type">
          {TYPE_OPTIONS.map((o) => (
            <FilterPill
              key={o.value}
              value={o.value}
              current={typeFilter}
              label={o.label}
              onSelect={onTypeChange}
            />
          ))}
        </div>
      </div>

      {hasFilters && (
        <p className="text-muted-foreground text-xs">
          Showing {resultCount} of {totalCount} bridge instances
        </p>
      )}
    </div>
  );
}

// ─── Lag display ──────────────────────────────────────────
function LagCell({ lag, status }: { lag: number; status: string }) {
  const absLag = Math.abs(lag);
  if (absLag === 0) {
    return <span className="font-mono text-sm text-emerald-500">0</span>;
  }
  let color = "text-amber-400";
  if (status === "out_of_sync" || absLag > 5) color = "text-red-400";
  else if (status === "syncing") color = "text-blue-400";
  return <span className={`${color} font-mono text-sm font-semibold`}>{absLag}</span>;
}

// ─── Bridge type badge ────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Native: "bg-blue-500/10 text-blue-400",
  Message: "bg-amber-500/10 text-amber-400",
  Token: "bg-teal-500/10 text-teal-400",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${TYPE_COLORS[type] ?? "bg-muted text-muted-foreground"}`}
    >
      {type}
    </span>
  );
}

function getRowHighlight(syncStatus: string): string {
  if (syncStatus === "out_of_sync") return "bg-red-500/2";
  if (syncStatus === "stale") return "bg-amber-500/2";
  return "";
}

// ─── Main bridge status table ─────────────────────────────
function BridgeStatusTable({ rows }: { rows: BridgeInstanceRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">No bridge instances match your filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-10">Status</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Src Nonce</TableHead>
            <TableHead className="text-right">Dst Nonce</TableHead>
            <TableHead className="text-right">Lag</TableHead>
            <TableHead className="text-right">Updated</TableHead>
            <TableHead className="w-20 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={`hover:bg-muted/30 transition-colors ${getRowHighlight(row.syncStatus)}`}
            >
              <TableCell>
                <SyncStatusBadge status={row.syncStatus} />
              </TableCell>
              <TableCell className="text-foreground text-sm font-medium whitespace-nowrap">
                {row.directionLabel}
              </TableCell>
              <TableCell className="text-foreground text-sm">{row.assetLabel}</TableCell>
              <TableCell>
                <TypeBadge type={row.bridgeTypeLabel} />
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {row.sourceNonce.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums">
                {row.destinationNonce.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-right">
                <LagCell lag={row.lag} status={row.syncStatus} />
              </TableCell>
              <TableCell
                className="text-muted-foreground text-right text-xs whitespace-nowrap"
                title={row.lastUpdatedAt}
              >
                {relativeTime(row.lastUpdatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/bridges/${row.slug}`}
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
                >
                  Details →
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Composed dashboard view ──────────────────────────────
interface OperatorDashboardProps {
  statuses: DirectionalBridgeStatus[];
  summary: BridgeDashboardSummary;
}

export function OperatorDashboard({ statuses, summary }: OperatorDashboardProps) {
  const allRows = useMemo(() => toBridgeInstanceRows(statuses), [statuses]);
  const problematicRows = useMemo(() => getProblematicRows(allRows), [allRows]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredRows = useMemo(() => {
    let rows = allRows;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.assetLabel.toLowerCase().includes(q) ||
          r.bridgeFamily.toLowerCase().includes(q) ||
          r.directionLabel.toLowerCase().includes(q) ||
          (r.tokenSymbol?.toLowerCase().includes(q) ?? false)
      );
    }

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.syncStatus === statusFilter);
    }

    if (directionFilter !== "all") {
      const [src, , dst] = directionFilter.split("_to_");
      rows = rows.filter((r) => r.sourceChain === src && r.destinationChain === dst);
    }

    if (typeFilter !== "all") {
      rows = rows.filter((r) => r.bridgeFamily === typeFilter);
    }

    return sortBySeverity(rows);
  }, [allRows, search, statusFilter, directionFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* A. Top summary strip */}
      <SummaryStrip summary={summary} />

      {/* D. Needs attention — only when problems exist */}
      <NeedsAttention rows={problematicRows} />

      {/* C. Filters */}
      <DashboardFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        directionFilter={directionFilter}
        onDirectionChange={setDirectionFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        resultCount={filteredRows.length}
        totalCount={allRows.length}
      />

      {/* B. Main bridge status table */}
      <BridgeStatusTable rows={filteredRows} />
    </div>
  );
}
