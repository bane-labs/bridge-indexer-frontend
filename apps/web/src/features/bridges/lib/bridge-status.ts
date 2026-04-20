import type {
  BridgeDashboardData,
  BridgeDashboardSummary,
  BridgeSideState,
  DirectionalBridgeStatus,
  SyncStatus,
} from "../types/bridge";

/** Threshold in milliseconds to consider data stale (5 minutes). */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Derive sync status from source and destination state.
 * This provides client-side resilience even if the backend later supplies status directly.
 */
export function deriveSyncStatus(
  source: BridgeSideState,
  destination: BridgeSideState,
  now = new Date()
): SyncStatus {
  // If nonce and root match, the bridge is synced — regardless of data age.
  // Correct nonces and roots take priority over staleness.
  if (source.nonce === destination.nonce && source.root === destination.root) {
    return "synced";
  }

  // If nonces are close (within 2), consider it syncing
  const nonceDiff = Math.abs(source.nonce - destination.nonce);
  if (nonceDiff <= 2 && nonceDiff > 0) {
    return "syncing";
  }

  // Only report stale when the data is outdated AND we can't confirm sync state
  const sourceDate = source.updatedAt ? new Date(source.updatedAt) : now;
  const destDate = destination.updatedAt ? new Date(destination.updatedAt) : now;
  const latestUpdate = Math.max(sourceDate.getTime(), destDate.getTime());
  if (now.getTime() - latestUpdate > STALE_THRESHOLD_MS) {
    return "stale";
  }

  return "out_of_sync";
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
  const counts: Record<SyncStatus, number> = {
    synced: 0,
    out_of_sync: 0,
    syncing: 0,
    stale: 0,
    unknown: 0,
  };

  let latestUpdate = "";
  for (const d of directions) {
    counts[d.syncStatus]++;
    if (!latestUpdate || d.lastUpdatedAt > latestUpdate) {
      latestUpdate = d.lastUpdatedAt;
    }
  }

  return {
    total: directions.length,
    synced: counts.synced,
    outOfSync: counts.out_of_sync,
    stale: counts.stale,
    syncing: counts.syncing,
    unknown: counts.unknown,
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
