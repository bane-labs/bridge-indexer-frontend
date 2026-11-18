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

  const lastUpdatedAt = [sync.src_observed_at, sync.dst_observed_at]
    .filter((timestamp): timestamp is string => timestamp !== undefined)
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
  const tokenPairId =
    sync.bridge_type === "token" && sync.src_token && sync.dst_token
      ? (sourceChain === "neo_n3"
          ? [sync.src_token, sync.dst_token]
          : [sync.dst_token, sync.src_token]
        )
          .join(":")
          .toLowerCase()
      : undefined;

  const tokenSymbol =
    sync.bridge_type === "token"
      ? (sync.src_token_symbol ?? resolveTokenSymbol(sync.src_token ?? undefined))
      : undefined;

  const operationStatus = mapOperationStatus(sync.status);
  const indexerStatus =
    sourceIndexer?.is_syncing || destIndexer?.is_syncing
      ? "lagging"
      : mapIndexerStatus(sourceIndexer && destIndexer ? sourceIndexer : null);

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
 * Map backend sync instances + indexer state to frontend DirectionalBridgeStatus[].
 */
export function mapSyncInstancesToStatuses(
  syncInstances: BackendDirectionalInstanceSync[],
  indexerState: BackendIndexerStateResponse
): DirectionalBridgeStatus[] {
  return syncInstances.map((sync) => mapInstance(sync, indexerState));
}
