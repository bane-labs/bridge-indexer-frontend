/**
 * Bridge Explorer Feature
 *
 * Dashboard for monitoring the health and sync status of all
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

// Service — dashboard
export { getBridgeDashboard } from "./lib/get-bridge-dashboard";

// Service — bridge state
export { getBridgeState } from "./lib/get-bridge-state";

// Lib — comparison
export {
  copyToClipboard,
  deriveComparisonSummary,
  deriveStaleReason,
  getComparisonLabel,
} from "./lib/bridge-comparison";

// Components — dashboard
export { BridgeDashboardEmpty } from "./components/bridge-dashboard-empty";
export { BridgeDashboardError } from "./components/bridge-dashboard-error";
export { BridgeDashboardSkeleton } from "./components/bridge-dashboard-skeleton";
export { BridgeDashboardSummary as BridgeDashboardSummaryPanel } from "./components/bridge-dashboard-summary";
export { BridgeGroupSection } from "./components/bridge-group-section";
export { ChainStateRow } from "./components/chain-state-row";
export { DirectionalBridgeCard } from "./components/directional-bridge-card";
export { SyncStatusBadge } from "./components/sync-status-badge";

// Components — bridge state
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
