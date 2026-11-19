import type {
  BackendOperationalHealth,
  BackendLegacyHealth,
  BackendDirectionalInstanceSync,
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
