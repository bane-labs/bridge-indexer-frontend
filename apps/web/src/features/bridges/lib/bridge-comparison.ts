import type { BridgeSideState } from "../types/bridge";
import type { ComparisonSummary } from "../types/bridge-state";

/**
 * Derive a human-readable comparison summary between source and destination states.
 */
export function deriveComparisonSummary(
  source: BridgeSideState,
  destination: BridgeSideState
): ComparisonSummary {
  const nonceMatch = source.nonce === destination.nonce;
  const rootMatch = source.root === destination.root;

  if (nonceMatch && rootMatch) return "nonce_and_root_match";
  if (!nonceMatch && !rootMatch) return "nonce_and_root_mismatch";
  if (!nonceMatch) return "nonce_mismatch";
  return "root_mismatch";
}

/** Map comparison summary to a display label. */
const COMPARISON_LABELS: Record<ComparisonSummary, string> = {
  nonce_and_root_match: "Nonce and root match",
  nonce_mismatch: "Nonce mismatch",
  root_mismatch: "Root mismatch",
  nonce_and_root_mismatch: "Nonce and root mismatch",
  data_stale: "Data stale",
};

export function getComparisonLabel(summary: ComparisonSummary): string {
  return COMPARISON_LABELS[summary];
}

/**
 * Derive a stale reason string for display.
 * Returns undefined if not stale.
 */
export function deriveStaleReason(
  source: BridgeSideState,
  destination: BridgeSideState,
  thresholdMs: number,
  now = new Date()
): string | undefined {
  if (!source.updatedAt || !destination.updatedAt) return undefined;

  const sourceAge = now.getTime() - new Date(source.updatedAt).getTime();
  const destAge = now.getTime() - new Date(destination.updatedAt).getTime();

  const reasons: string[] = [];
  if (sourceAge > thresholdMs) {
    reasons.push(`source data is ${formatAge(sourceAge)} old`);
  }
  if (destAge > thresholdMs) {
    reasons.push(`destination data is ${formatAge(destAge)} old`);
  }

  return reasons.length > 0 ? reasons.join("; ") : undefined;
}

function formatAge(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/**
 * Copy text to clipboard. Returns true on success.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
