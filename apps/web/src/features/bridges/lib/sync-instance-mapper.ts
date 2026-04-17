/**
 * Maps backend /sync/instances + /indexer/state + /health data
 * to frontend DirectionalBridgeStatus[] for dashboard display.
 *
 * This replaces the old approach of deriving sync status from operations.
 * The backend now provides authoritative sync state computed from actual
 * on-chain bridge contract state.
 */

import { resolveTokenSymbol } from "./bridge-operation-utils";

import type { ChainId, DirectionalBridgeStatus, SyncStatus } from "../types/bridge";
import type {
  BackendDirectionalInstanceSync,
  BackendDirectionalSyncStatus,
  BackendIndexerStateResponse,
  BackendOverallHealth,
} from "../types/backend-api";

const EMPTY_ROOT = "0x0";

/** Map backend sync status to frontend SyncStatus. */
function mapSyncStatus(
  backendStatus: BackendDirectionalSyncStatus,
  deltaNonce?: number
): SyncStatus {
  switch (backendStatus) {
    case "synced":
      return "synced";
    case "source_ahead":
      // Small lag → syncing, large lag → out_of_sync
      if (deltaNonce !== undefined && deltaNonce <= 2) {
        return "syncing";
      }
      return "out_of_sync";
    case "root_mismatch":
      return "out_of_sync";
    case "unknown":
      return "unknown";
    default:
      return "unknown";
  }
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
    sync.bridge_type === "token" ? resolveTokenSymbol(sync.src_token ?? undefined) : undefined;

  const syncStatus = mapSyncStatus(sync.status, sync.delta_nonce ?? undefined);

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
    syncStatus,
    isStale: false, // Backend provides real-time data; staleness detected by indexer state
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
  let pendingOperations = 0;
  let stuckOperations = 0;

  for (const bridge of health.bridges) {
    pendingOperations += bridge.pending_operations;
    stuckOperations += bridge.stuck_operations;
  }

  return {
    healthStatus: health.status,
    pendingOperations,
    stuckOperations,
    updatedAt: health.updated_at,
  };
}
