import { fetchHealth, fetchIndexerState, fetchSyncInstances } from "./bridge-operations-api";
import { buildDashboardData } from "./bridge-status";
import { extractHealthSummary, mapSyncInstancesToStatuses } from "./sync-instance-mapper";

import type { BridgeDashboardData } from "../types/bridge";

/**
 * Fetch bridge dashboard data from backend authoritative endpoints.
 *
 * Uses /sync/instances for sync status, /health for health data,
 * and /indexer/state for chain timestamps.
 */
export async function getBridgeDashboard(): Promise<BridgeDashboardData> {
  const [syncInstances, health, indexerState] = await Promise.all([
    fetchSyncInstances(),
    fetchHealth(),
    fetchIndexerState(),
  ]);

  const statuses = mapSyncInstancesToStatuses(syncInstances, indexerState);
  const dashboard = buildDashboardData(statuses);

  const healthSummary = extractHealthSummary(health);
  dashboard.summary.healthStatus = healthSummary.healthStatus;
  dashboard.summary.pendingOperations = healthSummary.pendingOperations;
  dashboard.summary.stuckOperations = healthSummary.stuckOperations;

  return dashboard;
}
