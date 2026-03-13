/**
 * Bridge Explorer Feature
 *
 * Operator dashboard for monitoring the health and sync status of all
 * directional bridge instances (Neo N3 ↔ Neo X).
 */

// Types — dashboard
export type {
  BridgeDashboardData,
  BridgeDashboardSummary,
  BridgeDirection,
  BridgeFamily,
  BridgeGroup,
  BridgeSideState,
  ChainId,
  DirectionalBridgeStatus,
  SyncStatus,
} from "./types/bridge";

// Types — bridge state
export type {
  BridgeStateFilter,
  BridgeStatePageData,
  BridgeStateSummary,
  BridgeSyncSection as BridgeSyncSectionData,
  ComparisonSummary,
  DirectionalBridgeSyncState,
} from "./types/bridge-state";

// Types — bridge history
export type {
  BridgeDirectionHistory,
  BridgeHistoryPageData,
  BridgeOperationHistoryRow,
} from "./types/bridge-history";

// Service — dashboard
export { getBridgeDashboard } from "./lib/get-bridge-dashboard";

// Service — bridge state
export { getBridgeState } from "./lib/get-bridge-state";

// Service — bridge history
export { getBridgeHistory } from "./lib/get-bridge-history";

// Lib — slugs
export {
  buildBridgeContext,
  buildBridgeLabel,
  getBridgeSlug as buildBridgeSlug,
  KNOWN_BRIDGE_SLUGS,
  parseBridgeSlug,
} from "./lib/bridge-slugs";

// Lib — explorer links
export {
  getChainBadgeLabel,
  getExplorerLabel,
  getExplorerTxUrl,
} from "./lib/bridge-explorer-links";

// Lib — history formatters
export {
  formatSettledTime,
  formatSettledTooltip,
  shortenRoot,
  shortenTxHash,
} from "./lib/bridge-history-formatters";

// Lib — comparison
export {
  copyToClipboard,
  deriveComparisonSummary,
  deriveStaleReason,
  getComparisonLabel,
} from "./lib/bridge-comparison";

// Lib — bridge instance (flat rows for the operator dashboard)
export type { BridgeInstanceRow } from "./lib/bridge-instance";
export { getProblematicRows, sortBySeverity, toBridgeInstanceRows } from "./lib/bridge-instance";

// Components — operator dashboard (primary view)
export { OperatorDashboard } from "./components/operator-dashboard";
export { OperatorDashboardSkeleton } from "./components/operator-dashboard-skeleton";

// Components — detail view
export { BridgeDetailView } from "./components/bridge-detail-view";

// Components — dashboard (legacy, still used internally)
export { BridgeDashboardEmpty } from "./components/bridge-dashboard-empty";
export { BridgeDashboardError } from "./components/bridge-dashboard-error";
export { BridgeDashboardSkeleton } from "./components/bridge-dashboard-skeleton";
export { BridgeDashboardSummary as BridgeDashboardSummaryPanel } from "./components/bridge-dashboard-summary";
export { BridgeGroupSection } from "./components/bridge-group-section";
export { ChainStateRow } from "./components/chain-state-row";
export { DirectionalBridgeCard } from "./components/directional-bridge-card";
export { SyncStatusBadge } from "./components/sync-status-badge";

// Components — bridge state (preserved for potential advanced diagnostics)
export { BridgeSideStatePanel } from "./components/bridge-side-state-panel";
export { BridgeStateEmpty } from "./components/bridge-state-empty";
export { BridgeStateError } from "./components/bridge-state-error";
export { BridgeStateFilters } from "./components/bridge-state-filters";
export { BridgeStateNoResults } from "./components/bridge-state-no-results";
export { BridgeStateSkeleton } from "./components/bridge-state-skeleton";
export { BridgeStateView } from "./components/bridge-state-view";
export { BridgeSyncSection } from "./components/bridge-sync-section";
export { ComparisonSummaryBadge } from "./components/comparison-summary";
export { DirectionalBridgeSyncCard } from "./components/directional-bridge-sync-card";
export { StaleIndicator } from "./components/stale-indicator";

// Components — bridge history
export { BridgeHistoryEmptyState } from "./components/bridge-history-empty-state";
export { BridgeHistoryError } from "./components/bridge-history-error";
export { BridgeHistoryHeader } from "./components/bridge-history-header";
export { BridgeHistorySection } from "./components/bridge-history-section";
export { BridgeHistorySkeleton } from "./components/bridge-history-skeleton";
export { BridgeHistoryTable } from "./components/bridge-history-table";
export { CopyButton } from "./components/copy-button";
export { HashCell } from "./components/hash-cell";
export { TxLinkCell } from "./components/tx-link-cell";
