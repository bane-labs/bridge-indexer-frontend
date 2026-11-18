import { fetchHealth, fetchIndexerState, fetchSyncInstances } from "./bridge-operations-api";
import { getOperationalHealth } from "./operational-health";
import { buildDashboardData } from "./bridge-status";
import { mapSyncInstancesToStatuses } from "./sync-instance-mapper";

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
    fetchHealth().catch(() => undefined),
    fetchIndexerState(),
  ]);

  const statuses = mapSyncInstancesToStatuses(syncInstances, indexerState);
  const dashboard = buildDashboardData(statuses);

  dashboard.summary.health = getOperationalHealth(health);

  return dashboard;
}
