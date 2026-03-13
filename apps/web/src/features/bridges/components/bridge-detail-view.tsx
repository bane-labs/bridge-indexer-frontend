import Link from "next/link";

import { Badge, Card, CardContent } from "@atlas/ui";

import { buildBridgeContext } from "../lib/bridge-slugs";
import {
  formatBlockNumber,
  formatNonce,
  getChainLabel,
  getDirectionLabel,
  relativeTime,
  shortenHash,
} from "../lib/formatters";

import { BridgeHistorySection } from "./bridge-history-section";
import { SyncStatusBadge } from "./sync-status-badge";

import type { DirectionalBridgeStatus } from "../types/bridge";
import type { BridgeHistoryPageData } from "../types/bridge-history";

interface BridgeDetailViewProps {
  history: BridgeHistoryPageData;
  /** Matching directional bridge statuses (sync state) for this bridge. */
  statuses: DirectionalBridgeStatus[];
}

/**
 * Full detail view for a single bridge instance (both directions).
 * Composes: header → sync summary cards → history tables.
 */
export function BridgeDetailView({ history, statuses }: BridgeDetailViewProps) {
  const [first] = history.directions;
  const sourceLabel = getChainLabel(first.sourceChain);
  const destLabel = getChainLabel(first.destinationChain);
  const context = buildBridgeContext(
    history.bridgeFamily,
    sourceLabel,
    destLabel,
    history.tokenSymbol
  );

  const FAMILY_COLORS: Record<string, string> = {
    native: "bg-blue-500/10 text-blue-400",
    message: "bg-amber-500/10 text-amber-400",
  };
  const familyColor = FAMILY_COLORS[history.bridgeFamily] ?? "bg-teal-500/10 text-teal-400";

  return (
    <>
      {/* A. Page header */}
      <header className="mb-8">
        <nav className="mb-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {history.label}
          </h1>
          <Badge variant="outline" className={familyColor}>
            {history.bridgeFamily}
          </Badge>
        </div>

        <p className="text-muted-foreground mt-1.5 font-mono text-sm">{context}</p>
      </header>

      {/* B. Sync summary cards for each direction */}
      {statuses.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {statuses.map((s) => (
            <DirectionSyncCard key={s.id} status={s} />
          ))}
        </div>
      )}

      {/* C. History tables per direction */}
      <div className="space-y-10">
        {history.directions.map((direction) => (
          <BridgeHistorySection
            key={`${direction.sourceChain}-${direction.destinationChain}`}
            direction={direction}
          />
        ))}
      </div>
    </>
  );
}

// ─── Compact sync summary card per direction ──────────────
function DirectionSyncCard({ status }: { status: DirectionalBridgeStatus }) {
  const directionLabel = getDirectionLabel(status.sourceChain, status.destinationChain);
  const lag = status.source.nonce - status.destination.nonce;
  const rootMatch = status.source.root === status.destination.root;

  return (
    <Card className="gap-0">
      <CardContent className="space-y-4 py-4">
        {/* Direction heading + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-sm font-semibold">{directionLabel}</span>
          <SyncStatusBadge status={status.syncStatus} />
        </div>

        {/* Compact comparison grid */}
        <dl className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-2 text-sm">
          {/* Header labels */}
          <dt className="text-muted-foreground text-xs font-medium">Source</dt>
          <dt />
          <dt className="text-muted-foreground text-right text-xs font-medium">Destination</dt>

          {/* Nonce row */}
          <dd className="font-mono tabular-nums">{formatNonce(status.source.nonce)}</dd>
          <dd className="text-muted-foreground text-center text-xs">Nonce</dd>
          <dd className="text-right font-mono tabular-nums">
            {formatNonce(status.destination.nonce)}
          </dd>

          {/* Nonce lag */}
          <dd />
          <dd className="text-center">
            <NonceLag lag={lag} syncStatus={status.syncStatus} />
          </dd>
          <dd />

          {/* Root row */}
          <dd className="font-mono text-xs tabular-nums" title={status.source.root}>
            {shortenHash(status.source.root, 8, 4)}
          </dd>
          <dd className="text-center text-xs">Root</dd>
          <dd className="text-right font-mono text-xs tabular-nums" title={status.destination.root}>
            {shortenHash(status.destination.root, 8, 4)}
          </dd>

          {/* Root match */}
          <dd />
          <dd className="text-center">
            <RootMatchBadge match={rootMatch} />
          </dd>
          <dd />

          {/* Block row */}
          {status.source.blockNumber !== undefined &&
            status.destination.blockNumber !== undefined && (
              <>
                <dd className="font-mono text-xs tabular-nums">
                  {formatBlockNumber(status.source.blockNumber)}
                </dd>
                <dd className="text-muted-foreground text-center text-xs">Block</dd>
                <dd className="text-right font-mono text-xs tabular-nums">
                  {formatBlockNumber(status.destination.blockNumber)}
                </dd>
              </>
            )}

          {/* Updated row */}
          <dd className="text-muted-foreground text-xs" title={status.source.updatedAt}>
            {relativeTime(status.source.updatedAt)}
          </dd>
          <dd className="text-muted-foreground text-center text-xs">Updated</dd>
          <dd
            className="text-muted-foreground text-right text-xs"
            title={status.destination.updatedAt}
          >
            {relativeTime(status.destination.updatedAt)}
          </dd>
        </dl>
      </CardContent>
    </Card>
  );
}

function NonceLag({ lag, syncStatus }: { lag: number; syncStatus: string }) {
  const absLag = Math.abs(lag);
  if (absLag === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
        ±0
      </span>
    );
  }
  const color =
    syncStatus === "out_of_sync" || absLag > 5
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}
    >
      lag: {absLag}
    </span>
  );
}

function RootMatchBadge({ match }: { match: boolean }) {
  return match ? (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
      ✓ Match
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
      ✕ Mismatch
    </span>
  );
}
