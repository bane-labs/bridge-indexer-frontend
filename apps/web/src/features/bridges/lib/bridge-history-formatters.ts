/**
 * Formatting utilities specific to the bridge history view.
 *
 * Re-exports or wraps shared formatters with history-specific defaults.
 */

import { formatTimestamp, shortenHash } from "./formatters";

/** Shorten a tx hash for table display (longer prefix for readability). */
export function shortenTxHash(hash: string): string {
  return shortenHash(hash, 8, 6);
}

/** Shorten a root hash for table display. */
export function shortenRoot(root: string): string {
  return shortenHash(root, 6, 4);
}

/** Format a settled timestamp for the history table. */
export function formatSettledTime(iso: string): string {
  return formatTimestamp(iso);
}

/** Format a settled timestamp to an ISO date-only string for tooltips. */
export function formatSettledTooltip(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toISOString();
}
