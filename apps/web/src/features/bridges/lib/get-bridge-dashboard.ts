import { MOCK_BRIDGE_STATUSES } from "../data/mock-bridge-dashboard";

import { buildDashboardData } from "./bridge-status";

import type { BridgeDashboardData } from "../types/bridge";

/**
 * Fetch bridge dashboard data.
 *
 * Currently backed by mock data. When the real API is available,
 * replace the body with an actual fetch call — the return type stays the same.
 */
export async function getBridgeDashboard(): Promise<BridgeDashboardData> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return buildDashboardData(MOCK_BRIDGE_STATUSES);
}
