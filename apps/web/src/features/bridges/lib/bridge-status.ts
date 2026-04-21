import type {
  BridgeDashboardData,
  BridgeDashboardSummary,
  BridgeSideState,
  DirectionalBridgeStatus,
  IndexerStatus,
  OperationStatus,
} from "../types/bridge";

/** Threshold in milliseconds to consider data stale (5 minutes). */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Derive operation status from source and destination nonce/root state.
 * Used in the legacy path (deriving from operation lists, not /sync/instances).
 */
export function deriveOperationStatus(
  source: BridgeSideState,
  destination: BridgeSideState
): OperationStatus {
  // If nonce and root match, the bridge is synced — regardless of data age.
  if (source.nonce === destination.nonce && source.root === destination.root) {
    return "synced";
  }

  // If nonces are close (within 2), consider it within the relay window
  const nonceDiff = Math.abs(source.nonce - destination.nonce);
  if (nonceDiff <= 2 && nonceDiff > 0) {
    return "pending";
  }

  return "delayed";
}

/**
 * Derive indexer status from the latest update timestamp.
 * Used in the legacy path when we don't have /indexer/state data.
 */
export function deriveIndexerStatus(
  latestUpdatedAt: string | undefined,
  now = new Date()
): IndexerStatus {
  if (!latestUpdatedAt) return "unknown";
  const date = new Date(latestUpdatedAt);
  if (isNaN(date.getTime())) return "unknown";
  return now.getTime() - date.getTime() > STALE_THRESHOLD_MS ? "lagging" : "fresh";
}

/**
 * @deprecated Use deriveOperationStatus + deriveIndexerStatus separately.
 * Kept for call-sites that have not been migrated yet.
 */
export function deriveSyncStatus(
  source: BridgeSideState,
  destination: BridgeSideState,
  now = new Date()
): OperationStatus {
  void now; // indexer staleness is now a separate dimension
  return deriveOperationStatus(source, destination);
}

/**
 * Check whether a bridge's data is stale based on its latest update timestamp.
 */
export function isDataStale(lastUpdatedAt: string, now = new Date()): boolean {
  const date = new Date(lastUpdatedAt);
  return now.getTime() - date.getTime() > STALE_THRESHOLD_MS;
}

/**
 * Compute aggregate summary from all directional bridges.
 */
export function computeDashboardSummary(
  directions: DirectionalBridgeStatus[]
): BridgeDashboardSummary {
  const opCounts: Record<OperationStatus, number> = { synced: 0, pending: 0, delayed: 0 };
  const idxCounts: Record<IndexerStatus, number> = { fresh: 0, lagging: 0, unknown: 0 };

  let latestUpdate = "";
  for (const d of directions) {
    opCounts[d.operationStatus]++;
    idxCounts[d.indexerStatus]++;
    if (!latestUpdate || d.lastUpdatedAt > latestUpdate) {
      latestUpdate = d.lastUpdatedAt;
    }
  }

  return {
    total: directions.length,
    synced: opCounts.synced,
    pending: opCounts.pending,
    delayed: opCounts.delayed,
    fresh: idxCounts.fresh,
    lagging: idxCounts.lagging,
    indexerUnknown: idxCounts.unknown,
    lastRefreshedAt: latestUpdate || new Date().toISOString(),
  };
}

/**
 * Compute full dashboard data from a list of directional bridge statuses.
 */
export function buildDashboardData(directions: DirectionalBridgeStatus[]): BridgeDashboardData {
  const summary = computeDashboardSummary(directions);

  // Group by bridge family + optional token symbol
  const groupMap = new Map<
    string,
    { family: string; token?: string; dirs: DirectionalBridgeStatus[] }
  >();

  for (const d of directions) {
    const key = d.tokenSymbol ? `token-${d.tokenSymbol.toLowerCase()}` : d.bridgeFamily;
    const existing = groupMap.get(key);
    if (existing) {
      existing.dirs.push(d);
    } else {
      groupMap.set(key, {
        family: d.bridgeFamily,
        token: d.tokenSymbol,
        dirs: [d],
      });
    }
  }

  const groups = Array.from(groupMap.entries()).map(([id, { family, token, dirs }]) => {
    let label: string;
    if (token) {
      label = `${token} Token Bridge`;
    } else if (family === "native") {
      label = "Native Bridge";
    } else if (family === "message") {
      label = "Message Bridge";
    } else {
      label = `${family} Bridge`;
    }

    return {
      id,
      bridgeFamily: dirs[0]!.bridgeFamily,
      tokenSymbol: token,
      label,
      directions: dirs,
    };
  });

  // Sort: native first, then message, then tokens alphabetically
  const familyOrder: Record<string, number> = { native: 0, message: 1, token: 2 };
  groups.sort((a, b) => {
    const orderA = familyOrder[a.bridgeFamily] ?? 3;
    const orderB = familyOrder[b.bridgeFamily] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    return a.label.localeCompare(b.label);
  });

  return { summary, groups, statuses: directions };
}
