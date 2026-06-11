/**
 * TypeScript types mirroring the backend Go API response shapes.
 *
 * These types are the single source of truth for what the backend returns.
 * All mapping to frontend-specific display types happens in the lib/ layer.
 */

import type { BridgeFamily, ChainId } from "./bridge";

// ---------------------------------------------------------------------------
// GET /operations
// ---------------------------------------------------------------------------

export type BackendBridgeType = BridgeFamily;
export type BackendDirection = "deposit" | "withdrawal";
export type BackendOperationStatus = "pending" | "completed" | "stuck";
export type BackendAMBMessageType = "executable" | "store_only" | "result";

export interface BackendBridgeOperation {
  bridge_type: BackendBridgeType;
  direction: BackendDirection;
  nonce: number;
  source_chain: ChainId;
  destination_chain: ChainId;
  source_block_height: number;
  dest_block_height?: number;
  source_tx_hash: string;
  dest_tx_hash?: string;
  token_contract?: string;
  dest_token_contract?: string;
  /** When present, on-chain token ticker as returned by the indexer. */
  token_symbol?: string;
  root?: string;
  amount?: string;
  from_address: string;
  to_address: string;
  timestamp: string;
  completion_timestamp?: string;
  status: BackendOperationStatus;
  amb_message_type?: BackendAMBMessageType;
  /**
   * Present on `stuck` operations that have been claimed by the user on the
   * destination chain. The transaction where the user executed the claim.
   */
  claim_tx_hash?: string;
}

export interface BackendOperationsResponse {
  operations: BackendBridgeOperation[];
  total: number;
}

// ---------------------------------------------------------------------------
// GET /sync/instances
// ---------------------------------------------------------------------------

export type BackendDirectionalSyncStatus = "synced" | "source_ahead" | "root_mismatch" | "unknown";

export type BackendDirectionalSyncReason =
  | "SYNCED"
  | "SOURCE_NONCE_GREATER_THAN_DESTINATION"
  | "ROOT_MISMATCH_AT_EQUAL_NONCE"
  | "MISSING_STATE"
  | "INVARIANT_VIOLATION";

export interface BackendDirectionalInstanceSync {
  id: string;
  bridge_type: BackendBridgeType;
  src_chain: string;
  dst_chain: string;
  src_token?: string;
  dst_token?: string;
  /** Present for token bridge instances when the server can resolve symbol() via RPC. */
  src_token_symbol?: string;
  dst_token_symbol?: string;
  status: BackendDirectionalSyncStatus;
  delta_nonce?: number;
  src_nonce?: number;
  dst_nonce?: number;
  src_root?: string;
  dst_root?: string;
  reason: BackendDirectionalSyncReason;
}

// ---------------------------------------------------------------------------
// GET /health
// ---------------------------------------------------------------------------

export type BackendHealthStatus = "healthy" | "degraded" | "unhealthy";

export interface BackendBridgeHealth {
  bridge_type: BackendBridgeType;
  status: BackendHealthStatus;
  deposits_paused: boolean;
  withdrawals_paused: boolean;
  avg_completion_24h_seconds?: number;
  avg_completion_7d_seconds?: number;
  uptime_percentage?: number;
}

export interface BackendOverallHealth {
  status: BackendHealthStatus;
  bridges: BackendBridgeHealth[];
  updated_at: string;
}

// ---------------------------------------------------------------------------
// GET /health/delays
// ---------------------------------------------------------------------------

export interface BackendDelayMetrics {
  avg_24h_seconds: Record<BackendBridgeType, number>;
  avg_7d_seconds: Record<BackendBridgeType, number>;
}

// ---------------------------------------------------------------------------
// GET /indexer/state
// ---------------------------------------------------------------------------

export interface BackendIndexerState {
  chain: string;
  last_block_height: number;
  last_block_hash: string;
  is_syncing: boolean;
  updated_at: string;
}

export interface BackendIndexerStateResponse {
  neo_n3: BackendIndexerState | null;
  neo_x: BackendIndexerState | null;
}
