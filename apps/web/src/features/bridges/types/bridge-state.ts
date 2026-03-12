import type { BridgeFamily, DirectionalBridgeStatus } from "./bridge";

/**
 * Extended directional bridge sync state with comparison details
 * for the operator state-inspection view.
 */
export interface DirectionalBridgeSyncState extends DirectionalBridgeStatus {
  staleReason?: string;
  comparisonSummary: ComparisonSummary;
}

/** Comparison result between source and destination. */
export type ComparisonSummary =
  | "nonce_and_root_match"
  | "nonce_mismatch"
  | "root_mismatch"
  | "nonce_and_root_mismatch"
  | "data_stale";

/** A bridge section grouping both directions for a single bridge. */
export interface BridgeSyncSection {
  id: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  title: string;
  directions: [DirectionalBridgeSyncState, DirectionalBridgeSyncState];
}

/** Complete data for the bridge state page. */
export interface BridgeStatePageData {
  sections: BridgeSyncSection[];
  summary: BridgeStateSummary;
}

/** Aggregate counts for the state page. */
export interface BridgeStateSummary {
  total: number;
  synced: number;
  outOfSync: number;
  stale: number;
  syncing: number;
  unknown: number;
}

/** Filter state for the bridge state page. */
export type BridgeStateFilter = "all" | "synced" | "out_of_sync" | "stale";
