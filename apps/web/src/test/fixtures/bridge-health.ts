import type {
  BackendBridgeOperation,
  BackendDirectionalInstanceSync,
  BackendLegacyHealth,
  BackendOperationalHealth,
} from "@/features/bridges/types/backend-api";

export const startupHealth: BackendOperationalHealth = {
  apiVersion: "v1",
  overallStatus: "unknown",
  checkedAt: null,
  summary: "Waiting for observations.",
  issueCount: 0,
  issues: [],
  bridges: [],
};
export const legacyBridgeHealth: BackendLegacyHealth = {
  status: "healthy",
  updated_at: "2026-11-19T10:00:00Z",
  bridges: [],
};
export const detailSync: BackendDirectionalInstanceSync = {
  id: "ndmeme-forward",
  bridge_type: "token",
  src_chain: "neo_n3",
  dst_chain: "neo_x",
  src_token: "0xaaa",
  dst_token: "0xbbb",
  src_token_symbol: "NDMEME",
  status: "source_ahead",
  reason: "SOURCE_NONCE_GREATER_THAN_DESTINATION",
  src_nonce: 42,
  dst_nonce: 1,
  delta_nonce: 41,
  src_root: "0xsource",
  src_block_number: 123,
  src_observed_at: "2026-11-19T09:00:00Z",
};

export const destinationSymbolSync: BackendDirectionalInstanceSync = {
  ...detailSync,
  src_token_symbol: undefined,
  dst_token_symbol: "NDMEME",
};
export const otherPairSync: BackendDirectionalInstanceSync = {
  ...detailSync,
  id: "ndmeme-other-pair",
  src_token: "0xccc",
  dst_token: "0xddd",
  src_nonce: 999,
  src_root: "0xother",
  dst_nonce: 998,
};
export const detailOperation: BackendBridgeOperation = {
  bridge_type: "token",
  direction: "deposit",
  nonce: 42,
  source_chain: "neo_n3",
  destination_chain: "neo_x",
  source_block_height: 123,
  source_tx_hash: "0xrequest",
  token_contract: "0xaaa",
  dest_token_contract: "0xbbb",
  token_symbol: "NDMEME",
  root: "0xsource",
  from_address: "0xsender",
  to_address: "0xrecipient",
  timestamp: "2026-11-19T09:00:00Z",
  status: "pending",
};
export const otherPairOperation: BackendBridgeOperation = {
  ...detailOperation,
  nonce: 999,
  token_contract: "0xccc",
  dest_token_contract: "0xddd",
  source_tx_hash: "0xother-request",
  root: "0xother",
};
