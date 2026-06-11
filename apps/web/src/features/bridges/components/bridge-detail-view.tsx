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
        <div className="mb-8 grid gap-4">
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
  const srcLabel = getChainLabel(status.sourceChain);
  const dstLabel = getChainLabel(status.destinationChain);
  const lag = status.source.nonce - status.destination.nonce;
  const rootMatch = status.source.root === status.destination.root;

  return (
    <Card className="gap-0">
      <CardContent className="space-y-4">
        {/* Direction heading + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-sm font-semibold">{directionLabel}</span>
          <SyncStatusBadge status={status.operationStatus} />
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Compares on-chain bridge state between {srcLabel} (source) and {dstLabel} (destination).
          Both the operation count and the state root must match for the bridge to be fully synced.
        </p>

        {/* Comparison table */}
        <div className="border-border overflow-hidden rounded-md border text-sm">
          {/* Column headers */}
          <div className="bg-muted/40 border-border grid grid-cols-[1fr_auto_1fr] border-b px-4 py-2.5 text-sm font-semibold">
            <span className="text-foreground">{srcLabel}</span>
            <span className="text-muted-foreground w-36 text-center">vs</span>
            <span className="text-foreground text-right">{dstLabel}</span>
          </div>

          {/* Operations (nonce) row */}
          <div className="border-border/50 grid grid-cols-[1fr_auto_1fr] items-center border-b px-4 py-4">
            <div>
              <div className="font-mono text-lg font-semibold tabular-nums">
                {formatNonce(status.source.nonce)}
              </div>
              <div className="text-muted-foreground text-xs">operations relayed</div>
            </div>
            <div className="flex w-36 flex-col items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                Nonce
              </span>
              <NonceLag lag={lag} syncStatus={status.operationStatus} />
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold tabular-nums">
                {formatNonce(status.destination.nonce)}
              </div>
              <div className="text-muted-foreground text-xs">operations relayed</div>
            </div>
          </div>

          {/* State root row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
            <div
              className="text-foreground/80 font-mono text-sm tabular-nums"
              title={status.source.root}
            >
              {shortenHash(status.source.root, 8, 4)}
            </div>
            <div className="flex w-36 flex-col items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                State Root
              </span>
              <RootMatchBadge match={rootMatch} />
            </div>
            <div
              className="text-foreground/80 text-right font-mono text-sm tabular-nums"
              title={status.destination.root}
            >
              {shortenHash(status.destination.root, 8, 4)}
            </div>
          </div>
        </div>

        {/* Block heights + last indexed timestamps */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground space-y-0.5">
            {status.source.blockNumber !== undefined && (
              <div>
                Block{" "}
                <span className="text-foreground/70 font-mono">
                  {formatBlockNumber(status.source.blockNumber)}
                </span>
              </div>
            )}
            <div title={status.source.updatedAt}>
              Indexed {relativeTime(status.source.updatedAt)}
            </div>
          </div>
          <div className="text-muted-foreground space-y-0.5 text-right">
            {status.destination.blockNumber !== undefined && (
              <div>
                Block{" "}
                <span className="text-foreground/70 font-mono">
                  {formatBlockNumber(status.destination.blockNumber)}
                </span>
              </div>
            )}
            <div title={status.destination.updatedAt}>
              Indexed {relativeTime(status.destination.updatedAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NonceLag({ lag, syncStatus }: { lag: number; syncStatus: string }) {
  const absLag = Math.abs(lag);
  if (absLag === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
        ✓ In sync
      </span>
    );
  }
  const color =
    syncStatus === "delayed" || absLag > 5
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}
    >
      {absLag} behind
    </span>
  );
}

function RootMatchBadge({ match }: { match: boolean }) {
  return match ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
      ✓ Roots match
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
      ✕ Roots differ
    </span>
  );
}
