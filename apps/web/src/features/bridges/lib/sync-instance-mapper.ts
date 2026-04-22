/**
 * Maps backend /sync/instances + /indexer/state + /health data
 * to frontend DirectionalBridgeStatus[] for dashboard display.
 *
 * This replaces the old approach of deriving sync status from operations.
 * The backend now provides authoritative sync state computed from actual
 * on-chain bridge contract state.
 */

import { resolveTokenSymbol } from "./bridge-operation-utils";

import type {
  BackendDirectionalInstanceSync,
  BackendDirectionalSyncStatus,
  BackendIndexerState,
  BackendIndexerStateResponse,
  BackendOverallHealth,
} from "../types/backend-api";
import type {
  ChainId,
  DirectionalBridgeStatus,
  IndexerStatus,
  OperationStatus,
} from "../types/bridge";

const EMPTY_ROOT = "0x0";

/** Map backend sync status to operation status (bridge relay progress). */
function mapOperationStatus(
  backendStatus: BackendDirectionalSyncStatus,
  deltaNonce?: number
): OperationStatus {
  switch (backendStatus) {
    case "synced":
      return "synced";
    case "source_ahead":
      // Small lag → within relay window (pending), larger lag → overdue (delayed)
      if (deltaNonce !== undefined && deltaNonce <= 2) {
        return "pending";
      }
      return "delayed";
    case "root_mismatch":
      return "delayed";
    case "unknown":
      return "delayed";
    default:
      return "delayed";
  }
}

/** Map backend indexer state to indexer status (data freshness). */
function mapIndexerStatus(state: BackendIndexerState | null): IndexerStatus {
  if (!state) return "unknown";
  if (state.is_syncing) return "lagging";
  return "fresh";
}

/** Map a single backend sync instance to frontend DirectionalBridgeStatus. */
function mapInstance(
  sync: BackendDirectionalInstanceSync,
  indexerState: BackendIndexerStateResponse
): DirectionalBridgeStatus {
  const sourceChain = sync.src_chain as ChainId;
  const destinationChain = sync.dst_chain as ChainId;

  const sourceIndexer = sourceChain === "neo_n3" ? indexerState.neo_n3 : indexerState.neo_x;
  const destIndexer = destinationChain === "neo_n3" ? indexerState.neo_n3 : indexerState.neo_x;

  const sourceUpdatedAt = sourceIndexer?.updated_at ?? new Date().toISOString();
  const destUpdatedAt = destIndexer?.updated_at ?? new Date().toISOString();
  const lastUpdatedAt =
    new Date(sourceUpdatedAt) > new Date(destUpdatedAt) ? sourceUpdatedAt : destUpdatedAt;

  const tokenSymbol =
    sync.bridge_type === "token"
      ? (sync.src_token_symbol ?? resolveTokenSymbol(sync.src_token ?? undefined))
      : undefined;

  const operationStatus = mapOperationStatus(sync.status, sync.delta_nonce ?? undefined);
  const indexerStatus = mapIndexerStatus(sourceIndexer);

  return {
    id: sync.id,
    bridgeFamily: sync.bridge_type,
    tokenSymbol,
    sourceChain,
    destinationChain,
    source: {
      nonce: sync.src_nonce ?? 0,
      root: sync.src_root ?? EMPTY_ROOT,
      updatedAt: sourceUpdatedAt,
    },
    destination: {
      nonce: sync.dst_nonce ?? 0,
      root: sync.dst_root ?? EMPTY_ROOT,
      updatedAt: destUpdatedAt,
    },
    operationStatus,
    indexerStatus,
    lastUpdatedAt,
    syncReason: sync.reason,
    deltaNonce: sync.delta_nonce ?? undefined,
  };
}

/**
 * Map backend sync instances + indexer state to frontend DirectionalBridgeStatus[].
 */
export function mapSyncInstancesToStatuses(
  syncInstances: BackendDirectionalInstanceSync[],
  indexerState: BackendIndexerStateResponse
): DirectionalBridgeStatus[] {
  return syncInstances.map((sync) => mapInstance(sync, indexerState));
}

/**
 * Compute aggregate health counts from backend health response.
 */
export function extractHealthSummary(health: BackendOverallHealth) {
  return {
    healthStatus: health.status,
    updatedAt: health.updated_at,
  };
}
