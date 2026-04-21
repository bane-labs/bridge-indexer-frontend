import { getBridgeDashboard } from "./get-bridge-dashboard";

import { deriveComparisonSummary, deriveStaleReason } from "./bridge-comparison";

import type { DirectionalBridgeStatus } from "../types/bridge";
import type {
  BridgeStatePageData,
  BridgeStateSummary,
  BridgeSyncSection,
  DirectionalBridgeSyncState,
} from "../types/bridge-state";

/** Threshold in milliseconds to consider data stale (5 minutes). */
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Enrich a directional bridge status with comparison and stale details.
 */
function enrichDirection(status: DirectionalBridgeStatus): DirectionalBridgeSyncState {
  const comparison = deriveComparisonSummary(status.source, status.destination);
  const staleReason = deriveStaleReason(status.source, status.destination, STALE_THRESHOLD_MS);

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

    // Ensure we always have exactly 2 directions (N3→X and X→N3)
    const enriched = dirs.map(enrichDirection);
    const n3ToX = enriched.find((d) => d.sourceChain === "neo_n3");
    const xToN3 = enriched.find((d) => d.sourceChain === "neo_x");

    if (n3ToX && xToN3) {
      sections.push({
        id,
        bridgeFamily: family,
        tokenSymbol: token,
        title,
        directions: [n3ToX, xToN3],
      });
    }
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
