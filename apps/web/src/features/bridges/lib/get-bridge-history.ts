import { MOCK_BRIDGE_HISTORY } from "../data/mock-bridge-history";

import type { BridgeHistoryData } from "../types/bridge-history";

/**
 * Fetch bridge history data for a given slug.
 *
 * Currently backed by mock data. When the real API is available,
 * replace the body with an actual fetch call — the return type stays the same.
 */
export async function getBridgeHistory(slug: string): Promise<BridgeHistoryData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return MOCK_BRIDGE_HISTORY[slug] ?? null;
}
