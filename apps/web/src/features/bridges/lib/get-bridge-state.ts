import { deriveComparisonSummary } from "./bridge-comparison";
import { getBridgeDashboard } from "./get-bridge-dashboard";

import type { DirectionalBridgeStatus } from "../types/bridge";
import type {
  BridgeStatePageData,
  BridgeStateSummary,
  BridgeSyncSection,
  DirectionalBridgeSyncState,
} from "../types/bridge-state";

/**
 * Enrich a directional bridge status with comparison and stale details.
 */
function enrichDirection(status: DirectionalBridgeStatus): DirectionalBridgeSyncState {
  const comparison = deriveComparisonSummary(status.source, status.destination);
  const staleReason =
    status.indexerStatus === "lagging" ? "An indexer is behind its chain tip." : undefined;

  return {
    ...status,
    comparisonSummary: status.indexerStatus !== "fresh" ? "data_stale" : comparison,
    staleReason,
  };
}

/**
 * Build bridge sync sections from raw directional statuses.
 */
function buildSections(statuses: DirectionalBridgeStatus[]): BridgeSyncSection[] {
  const groupMap = new Map<
    string,
    {
      family: DirectionalBridgeStatus["bridgeFamily"];
      token?: string;
      dirs: DirectionalBridgeStatus[];
    }
  >();

  for (const d of statuses) {
    const key = d.bridgeFamily === "token" ? (d.tokenPairId ?? d.id) : d.bridgeFamily;
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

  const sections: BridgeSyncSection[] = [];

  for (const [id, { family, token, dirs }] of groupMap) {
    let title: string;
    if (token) {
      title = `Token | Neo N3 ↔ Neo X | ${token}`;
    } else if (family === "native") {
      title = "Native | Neo N3 ↔ Neo X";
    } else if (family === "message") {
      title = "Message | Neo N3 ↔ Neo X";
    } else {
      title = `${family} | Neo N3 ↔ Neo X`;
    }

    sections.push({
      id,
      bridgeFamily: family,
      tokenSymbol: token,
      title,
      directions: dirs
        .map(enrichDirection)
        .sort((a, b) => a.sourceChain.localeCompare(b.sourceChain)),
    });
  }

  // Sort: native first, then message, then tokens alphabetically
  const familyOrder: Record<string, number> = {
    native: 0,
    message: 1,
    token: 2,
  };
  sections.sort((a, b) => {
    const orderA = familyOrder[a.bridgeFamily] ?? 3;
    const orderB = familyOrder[b.bridgeFamily] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });

  return sections;
}

/**
 * Compute summary counts from sections.
 */
function computeSummary(sections: BridgeSyncSection[]): BridgeStateSummary {
  const counts: BridgeStateSummary = {
    total: 0,
    synced: 0,
    pending: 0,
    delayed: 0,
    fresh: 0,
    lagging: 0,
    indexerUnknown: 0,
  };

  for (const section of sections) {
    for (const dir of section.directions) {
      counts.total++;
      switch (dir.operationStatus) {
        case "synced":
          counts.synced++;
          break;
        case "pending":
          counts.pending++;
          break;
        case "root_mismatch":
        case "delayed":
          counts.delayed++;
          break;
      }
      switch (dir.indexerStatus) {
        case "fresh":
          counts.fresh++;
          break;
        case "lagging":
          counts.lagging++;
          break;
        default:
          counts.indexerUnknown++;
      }
    }
  }

  return counts;
}

/**
 * Fetch bridge state data from the dashboard's real backend-backed statuses.
 */
export async function getBridgeState(): Promise<BridgeStatePageData> {
  const dashboard = await getBridgeDashboard();
  const sections = buildSections(dashboard.statuses);
  const summary = computeSummary(sections);

  return { sections, summary };
}
