import { deriveComparisonSummary } from "./bridge-comparison";
import { getDirectionLabel } from "./formatters";

import type { BridgeFamily, ChainId, DirectionalBridgeStatus, SyncStatus } from "../types/bridge";
import type { ComparisonSummary } from "../types/bridge-state";

/**
 * A flat, display-ready row representing a single directional bridge instance.
 * This is the primary unit of the operator dashboard — one row per direction.
 */
export interface BridgeInstanceRow {
  id: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  sourceChain: ChainId;
  destinationChain: ChainId;
  /** "Neo N3 → Neo X" */
  directionLabel: string;
  /** "GAS", "Native", "Message", etc. */
  assetLabel: string;
  /** "native" | "message" | "token" */
  bridgeTypeLabel: string;
  sourceNonce: number;
  destinationNonce: number;
  /** source nonce - destination nonce */
  lag: number;
  syncStatus: SyncStatus;
  isStale: boolean;
  lastUpdatedAt: string;
  /** Slug for linking to the detail page */
  slug: string;
  /** Root comparison result */
  rootMatch: boolean;
  comparisonSummary: ComparisonSummary;
  /** 0 = critical, 1 = warning, 2 = info, 3 = ok */
  severity: number;
}

const SEVERITY_MAP: Record<SyncStatus, number> = {
  out_of_sync: 0,
  stale: 1,
  syncing: 2,
  unknown: 2,
  synced: 3,
};

/**
 * Flatten directional bridge statuses into display-ready instance rows.
 * Computes all derived fields: lag, rootMatch, severity, labels.
 */
export function toBridgeInstanceRows(statuses: DirectionalBridgeStatus[]): BridgeInstanceRow[] {
  return statuses.map((d) => {
    const lag = d.source.nonce - d.destination.nonce;
    const rootMatch = d.source.root === d.destination.root;
    const comparison = d.isStale
      ? ("data_stale" as ComparisonSummary)
      : deriveComparisonSummary(d.source, d.destination);

    const assetLabel = d.tokenSymbol ?? (d.bridgeFamily === "native" ? "Native" : "Message");
    const FAMILY_TYPE_LABELS: Record<BridgeFamily, string> = {
      token: "Token",
      native: "Native",
      message: "Message",
    };
    const bridgeTypeLabel = FAMILY_TYPE_LABELS[d.bridgeFamily];

    const slug = d.tokenSymbol ? `token-${d.tokenSymbol.toLowerCase()}` : d.bridgeFamily;

    return {
      id: d.id,
      bridgeFamily: d.bridgeFamily,
      tokenSymbol: d.tokenSymbol,
      sourceChain: d.sourceChain,
      destinationChain: d.destinationChain,
      directionLabel: getDirectionLabel(d.sourceChain, d.destinationChain),
      assetLabel,
      bridgeTypeLabel,
      sourceNonce: d.source.nonce,
      destinationNonce: d.destination.nonce,
      lag,
      syncStatus: d.syncStatus,
      isStale: d.isStale,
      lastUpdatedAt: d.lastUpdatedAt,
      slug,
      rootMatch,
      comparisonSummary: comparison,
      severity: SEVERITY_MAP[d.syncStatus] ?? 2,
    };
  });
}

/** Sort instance rows by severity (worst first), then by lag descending. */
export function sortBySeverity(rows: BridgeInstanceRow[]): BridgeInstanceRow[] {
  return [...rows].sort((a, b) => {
    if (a.severity !== b.severity) return a.severity - b.severity;
    return Math.abs(b.lag) - Math.abs(a.lag);
  });
}

/** Get only rows that need attention (not synced). */
export function getProblematicRows(rows: BridgeInstanceRow[]): BridgeInstanceRow[] {
  return sortBySeverity(rows.filter((r) => r.syncStatus !== "synced"));
}
