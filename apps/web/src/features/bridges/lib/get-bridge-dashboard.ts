import { fetchHealth, fetchSyncInstances } from "./bridge-operations-api";
import { buildDashboardData } from "./bridge-status";
import { getOperationalHealth } from "./operational-health";
import { mapSyncInstancesToStatuses } from "./sync-instance-mapper";

import type { BridgeDashboardData } from "../types/bridge";

/**
 * Fetch bridge dashboard data from backend authoritative endpoints.
 *
 * Uses /sync/instances for sync status, /health for health data,
 * with per-side observations from /sync/instances.
 */
export async function getBridgeDashboard(): Promise<BridgeDashboardData> {
  const [syncInstances, health] = await Promise.all([
    fetchSyncInstances(),
    fetchHealth().catch(() => undefined),
  ]);

  const statuses = mapSyncInstancesToStatuses(syncInstances);
  const dashboard = buildDashboardData(statuses);

  dashboard.summary.health = getOperationalHealth(health);

  return dashboard;
}
