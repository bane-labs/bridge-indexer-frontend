/**
 * Maps backend /sync/instances data
 * to frontend DirectionalBridgeStatus[] for dashboard display.
 *
 * This replaces the old approach of deriving sync status from operations.
 * The backend now provides authoritative sync state computed from actual
 * on-chain bridge contract state.
 */

import { getTokenPairId, resolvedSyncInstanceTokenSymbol } from "./bridge-token-matching";

import type {
  BackendDirectionalInstanceSync,
  BackendDirectionalSyncStatus,
} from "../types/backend-api";
import type {
  ChainId,
  DirectionalBridgeStatus,
  IndexerStatus,
  OperationStatus,
} from "../types/bridge";

/** Map backend sync status to operation status (bridge relay progress). */
function mapOperationStatus(backendStatus: BackendDirectionalSyncStatus): OperationStatus {
  switch (backendStatus) {
    case "synced":
      return "synced";
    case "source_ahead":
      return "pending";
    case "root_mismatch":
    case "unknown":
      return backendStatus;
  }
}

/** Map a single backend sync instance to frontend DirectionalBridgeStatus. */
function mapInstance(sync: BackendDirectionalInstanceSync): DirectionalBridgeStatus {
  const sourceChain = sync.src_chain as ChainId;
  const destinationChain = sync.dst_chain as ChainId;

  const lastUpdatedAt = [sync.src_observed_at, sync.dst_observed_at]
    .filter((timestamp): timestamp is string => timestamp !== undefined)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const tokenPairId =
    sync.bridge_type === "token"
      ? getTokenPairId(sourceChain, sync.src_token, sync.dst_token)
      : undefined;

  const tokenSymbol = resolvedSyncInstanceTokenSymbol(sync);

  const operationStatus = mapOperationStatus(sync.status);
  // is_syncing is written during normal indexing and cannot establish lag.
  const indexerStatus: IndexerStatus = "unknown";

  return {
    id: sync.id,
    bridgeFamily: sync.bridge_type,
    tokenSymbol,
    tokenPairId,
    sourceChain,
    destinationChain,
    source: {
      nonce: sync.src_nonce,
      root: sync.src_root,
      blockNumber: sync.src_block_number,
      updatedAt: sync.src_observed_at,
    },
    destination: {
      synthetic: sync.dst_synthetic,
      nonce: sync.dst_nonce,
      root: sync.dst_root,
      blockNumber: sync.dst_block_number,
      updatedAt: sync.dst_observed_at,
    },
    operationStatus,
    indexerStatus,
    lastUpdatedAt,
    syncReason: sync.reason,
    deltaNonce: sync.delta_nonce ?? undefined,
  };
}

/**
 * Map backend sync instances to frontend DirectionalBridgeStatus[].
 */
export function mapSyncInstancesToStatuses(
  syncInstances: BackendDirectionalInstanceSync[]
): DirectionalBridgeStatus[] {
  return syncInstances.map((sync) => mapInstance(sync));
}
