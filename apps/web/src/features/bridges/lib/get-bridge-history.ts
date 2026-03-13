import { MOCK_BRIDGE_HISTORY } from "../data/mock-bridge-history";

import type { BridgeHistoryPageData } from "../types/bridge-history";

/**
 * Fetch bridge history data for a given slug.
 *
 * Currently backed by mock data. When the real API is available,
 * replace the body with an actual fetch call — the return type stays the same.
 *
 * The API response maps as follows:
 *   - BridgeOperation.nonce         → BridgeOperationHistoryRow.nonce
 *   - BridgeOperation.stateRoot     → BridgeOperationHistoryRow.root
 *   - BridgeOperation.sourceTxHash  → BridgeOperationHistoryRow.sourceTxHash
 *   - BridgeOperation.destTxHash    → BridgeOperationHistoryRow.destinationTxHash
 *   - BridgeOperation.settledAt     → BridgeOperationHistoryRow.settledAt
 *
 * Fields like sender, recipient, and amount are intentionally excluded
 * from this view's data model.
 */
export async function getBridgeHistory(slug: string): Promise<BridgeHistoryPageData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return MOCK_BRIDGE_HISTORY[slug] ?? null;
}
