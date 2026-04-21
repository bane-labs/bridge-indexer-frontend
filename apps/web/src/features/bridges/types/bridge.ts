/** Chain identifiers for the bridge network. */
export type ChainId = "neo_n3" | "neo_x";

/** Bridge family classification. */
export type BridgeFamily = "native" | "message" | "token";

/** Directional bridge direction. */
export type BridgeDirection = "neo_n3_to_neo_x" | "neo_x_to_neo_n3";

/**
 * Data freshness of the indexer for a bridge instance.
 * Answers: "Can we trust the data we are showing?"
 */
export type IndexerStatus = "fresh" | "lagging" | "unknown";

/**
 * Relay progress of a directional bridge instance.
 * Answers: "Is the bridge behaving as expected?"
 */
export type OperationStatus = "synced" | "pending" | "delayed";

/** State snapshot for one side (source or destination) of a bridge. */
export interface BridgeSideState {
  nonce: number;
  root: string;
  blockNumber?: number;
  updatedAt?: string;
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
  /** Relay progress — is the bridge behaving as expected? */
  operationStatus: OperationStatus;
  /** Data freshness — can we trust the data we are showing? */
  indexerStatus: IndexerStatus;
  lastUpdatedAt: string;
  /** Server-provided sync reason from /sync/instances. */
  syncReason?: string;
  /** Nonce lag (source - destination). */
  deltaNonce?: number;
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
  // ── Operation status counts (bridge relay progress) ──────
  /** Instances where the destination has caught up to the source. */
  synced: number;
  /** Instances within the expected relay window. */
  pending: number;
  /** Instances not relayed after the expected time window. */
  delayed: number;
  // ── Indexer status counts (data freshness) ───────────────
  /** Instances whose indexer is caught up to chain head. */
  fresh: number;
  /** Instances whose indexer is behind chain head. */
  lagging: number;
  /** Instances where indexer state cannot be determined. */
  indexerUnknown: number;
  lastRefreshedAt: string;
  /** Overall health status from backend. */
  healthStatus?: "healthy" | "degraded" | "unhealthy";
  /** Total pending operations across all bridge types. */
  pendingOperations?: number;
  /** Total stuck operations across all bridge types. */
  stuckOperations?: number;
}

/** Complete dashboard data response. */
export interface BridgeDashboardData {
  summary: BridgeDashboardSummary;
  groups: BridgeGroup[];
  /** Flat list of all directional statuses for table-based views. */
  statuses: DirectionalBridgeStatus[];
}
