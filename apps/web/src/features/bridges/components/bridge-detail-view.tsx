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
import { BridgeTokenPairIdentity } from "./bridge-token-pair-identity";
import { CopyButton } from "./copy-button";
import { IndexerStatusBadge, SyncStatusBadge } from "./sync-status-badge";

import type { BackendIndexerState, BackendIndexerStateResponse } from "../types/backend-api";
import type { ChainId, DirectionalBridgeStatus } from "../types/bridge";
import type { BridgeHistoryPageData } from "../types/bridge-history";

interface BridgeDetailViewProps {
  history: BridgeHistoryPageData;
  /** Matching directional bridge statuses (sync state) for this bridge. */
  statuses: DirectionalBridgeStatus[];
  /** Per-chain indexer state for liveness display. */
  indexerState?: BackendIndexerStateResponse;
  stateLoading?: boolean;
  stateError?: boolean;
  historyLoading?: boolean;
  historyError?: boolean;
}

/**
 * Full detail view for a single bridge instance (both directions).
 * Composes: header → sync summary cards → history tables.
 */
export function BridgeDetailView({
  history,
  statuses,
  indexerState,
  stateLoading,
  stateError,
  historyLoading,
  historyError,
}: BridgeDetailViewProps) {
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
  const verifiedTokenPair =
    history.tokenPairId &&
    (statuses.some((status) => status.tokenPairId === history.tokenPairId) ||
      (!historyLoading && !historyError && history.directions.some((dir) => dir.rows.length > 0)))
      ? history.tokenPairId
      : undefined;
  let stateContent = (
    <p className="text-muted-foreground text-sm">
      Directional bridge state unavailable from the backend.
    </p>
  );
  if (stateLoading) {
    stateContent = <p role="status">Loading bridge state…</p>;
  } else if (stateError) {
    stateContent = <p role="alert">Could not load directional bridge state.</p>;
  } else if (statuses.length > 0) {
    stateContent = (
      <div className="grid gap-4 xl:grid-cols-2">
        {statuses.map((s) => (
          <DirectionSyncCard key={s.id} status={s} indexerState={indexerState} />
        ))}
      </div>
    );
  }

  let historyContent = (
    <div className="space-y-10">
      {history.directions.map((direction) => (
        <BridgeHistorySection
          key={`${direction.sourceChain}-${direction.destinationChain}`}
          direction={direction}
        />
      ))}
    </div>
  );
  if (historyLoading) historyContent = <p role="status">Loading operation history…</p>;
  else if (historyError) historyContent = <p role="alert">Could not load operation history.</p>;

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

      {history.bridgeFamily === "token" && (
        <BridgeTokenPairIdentity tokenPairId={verifiedTokenPair} />
      )}

      <section aria-labelledby="bridge-state-heading" className="mb-8 space-y-4">
        <h2 id="bridge-state-heading" className="text-lg font-semibold">
          Observed bridge state
        </h2>
        <p className="text-muted-foreground text-sm">
          Bridge observations are event times. An older observation alone does not establish indexer
          lag.
        </p>
        {stateContent}
      </section>

      <section aria-labelledby="bridge-configuration-heading" className="mb-8 space-y-2">
        <h2 id="bridge-configuration-heading" className="text-lg font-semibold">
          Configuration
        </h2>
        <p className="text-muted-foreground text-sm">
          Contract configuration is unavailable from the backend API for this bridge.
        </p>
      </section>

      {historyContent}
    </>
  );
}

// ─── Compact sync summary card per direction ──────────────
function DirectionSyncCard({
  status,
  indexerState,
}: {
  status: DirectionalBridgeStatus;
  indexerState?: BackendIndexerStateResponse;
}) {
  const directionLabel = getDirectionLabel(status.sourceChain, status.destinationChain);
  const srcLabel = getChainLabel(status.sourceChain);
  const dstLabel = getChainLabel(status.destinationChain);
  const lag =
    status.deltaNonce ??
    (status.source.nonce !== undefined && status.destination.nonce !== undefined
      ? status.source.nonce - status.destination.nonce
      : undefined);
  const rootMatch = status.source.root === status.destination.root;

  return (
    <Card className="gap-0">
      <CardContent className="space-y-4">
        {/* Direction heading + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-sm font-semibold">{directionLabel}</span>
          <div className="flex gap-2">
            <SyncStatusBadge status={status.operationStatus} />
            <IndexerStatusBadge status={status.indexerStatus} />
          </div>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Compares backend observations on {srcLabel} (source) and {dstLabel} (destination). Nonces
          and roots are reported for this selected direction.
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
              <div className="text-muted-foreground text-[11px]">source</div>
            </div>
            <div className="flex w-36 flex-col items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                Nonce
              </span>
              {lag === undefined ? (
                "Unavailable"
              ) : (
                <NonceLag lag={lag} syncStatus={status.operationStatus} />
              )}
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold tabular-nums">
                {formatNonce(status.destination.nonce)}
              </div>
              <div className="text-muted-foreground text-[11px]">destination</div>
            </div>
          </div>

          {/* State root row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-4">
            <div
              className="text-foreground/80 font-mono text-sm tabular-nums"
              title={status.source.root}
            >
              {shortenHash(status.source.root, 8, 4)}
              {status.source.root && (
                <CopyButton text={status.source.root} label="Copy source state root" />
              )}
            </div>
            <div className="flex w-36 flex-col items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                State Root
              </span>
              {status.source.root === undefined || status.destination.root === undefined ? (
                "Unavailable"
              ) : (
                <RootMatchBadge match={rootMatch} />
              )}
            </div>
            <div
              className="text-foreground/80 text-right font-mono text-sm tabular-nums"
              title={status.destination.root}
            >
              {shortenHash(status.destination.root, 8, 4)}
              {status.destination.root && (
                <CopyButton text={status.destination.root} label="Copy destination state root" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[status.source, status.destination].map((side, index) => (
            <div key={index} className="text-muted-foreground space-y-0.5">
              <p>{index === 0 ? "Source observation" : "Destination observation"}</p>
              <div>
                Block{" "}
                {side.blockNumber === undefined
                  ? "Unavailable"
                  : formatBlockNumber(side.blockNumber)}
              </div>
              <div title={side.updatedAt}>
                Observed {side.updatedAt ? relativeTime(side.updatedAt) : "Unavailable"}
              </div>
              {side.synthetic && <p>Synthetic destination observation</p>}
            </div>
          ))}
        </div>

        {/* Chain indexer liveness */}
        {indexerState && (
          <ChainIndexerLiveness
            sourceChain={status.sourceChain}
            destinationChain={status.destinationChain}
            indexerState={indexerState}
          />
        )}
      </CardContent>
    </Card>
  );
}

function NonceLag({ lag, syncStatus }: { lag: number; syncStatus: string }) {
  const absLag = Math.abs(lag);
  if (absLag === 0) {
    return (
      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold">
        0 nonce difference
      </span>
    );
  }
  const color =
    lag < 0 || syncStatus === "delayed" || syncStatus === "root_mismatch"
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}
    >
      Destination {lag < 0 ? "ahead" : "behind"} by {absLag}
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

// ─── Chain indexer liveness strip ─────────────────────────
function ChainIndexerLivenessRow({
  state,
  label,
  alignRight,
}: {
  state: BackendIndexerState | null;
  label: string;
  alignRight?: boolean;
}) {
  if (!state) return null;
  const isSyncing = state.is_syncing;
  return (
    <div
      className={
        alignRight
          ? "text-muted-foreground space-y-0.5 text-right text-xs"
          : "text-muted-foreground space-y-0.5 text-xs"
      }
    >
      <div className="text-[11px] font-medium tracking-wide uppercase">{label}</div>
      <div>
        Indexed block:{" "}
        <span className="text-foreground/70 font-mono">
          {formatBlockNumber(state.last_block_height)}
        </span>
      </div>
      <div
        title={state.updated_at}
        className={
          alignRight
            ? "flex flex-wrap items-center justify-end gap-1.5"
            : "flex flex-wrap items-center gap-1.5"
        }
      >
        <span>{relativeTime(state.updated_at)}</span>
        {isSyncing && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
            ↻ syncing
          </span>
        )}
      </div>
    </div>
  );
}

function ChainIndexerLiveness({
  sourceChain,
  destinationChain,
  indexerState,
}: {
  sourceChain: ChainId;
  destinationChain: ChainId;
  indexerState: BackendIndexerStateResponse;
}) {
  const srcState = sourceChain === "neo_n3" ? indexerState.neo_n3 : indexerState.neo_x;
  const dstState = destinationChain === "neo_n3" ? indexerState.neo_n3 : indexerState.neo_x;
  const srcLabel = getChainLabel(sourceChain);
  const dstLabel = getChainLabel(destinationChain);

  return (
    <div className="border-t pt-3">
      <div className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
        Indexer liveness
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ChainIndexerLivenessRow state={srcState} label={srcLabel} />
        <ChainIndexerLivenessRow state={dstState} label={dstLabel} alignRight />
      </div>
    </div>
  );
}
