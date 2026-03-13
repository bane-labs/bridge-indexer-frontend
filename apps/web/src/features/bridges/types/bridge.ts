/** Chain identifiers for the bridge network. */
export type ChainId = "neo_n3" | "neo_x";

/** Bridge family classification. */
export type BridgeFamily = "native" | "message" | "token";

/** Directional bridge direction. */
export type BridgeDirection = "neo_n3_to_neo_x" | "neo_x_to_neo_n3";

/** Sync status of a directional bridge. */
export type SyncStatus = "synced" | "out_of_sync" | "syncing" | "stale" | "unknown";

/** State snapshot for one side (source or destination) of a bridge. */
export interface BridgeSideState {
  nonce: number;
  root: string;
  blockNumber?: number;
  updatedAt: string;
}

/** Status of a single directional bridge instance. */
export interface DirectionalBridgeStatus {
  id: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  sourceChain: ChainId;
  destinationChain: ChainId;
  source: BridgeSideState;
  destination: BridgeSideState;
  syncStatus: SyncStatus;
  isStale: boolean;
  lastUpdatedAt: string;
}

/** A group of directional bridges under a single bridge family/token. */
export interface BridgeGroup {
  id: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  label: string;
  directions: DirectionalBridgeStatus[];
}

/** Aggregate summary counts for the entire dashboard. */
export interface BridgeDashboardSummary {
  total: number;
  synced: number;
  outOfSync: number;
  stale: number;
  syncing: number;
  unknown: number;
  lastRefreshedAt: string;
}

/** Complete dashboard data response. */
export interface BridgeDashboardData {
  summary: BridgeDashboardSummary;
  groups: BridgeGroup[];
  /** Flat list of all directional statuses for table-based views. */
  statuses: DirectionalBridgeStatus[];
}
