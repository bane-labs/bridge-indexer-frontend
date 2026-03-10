import type { BridgeDirection, BridgeSideState, ChainId, SyncStatus } from "../types/bridge";

/** Map chain IDs to human-readable labels. */
const CHAIN_LABELS: Record<ChainId, string> = {
  neo_n3: "Neo N3",
  neo_x: "Neo X",
};

/** Map direction IDs to arrow-formatted labels. */
const DIRECTION_LABELS: Record<BridgeDirection, string> = {
  neo_n3_to_neo_x: "Neo N3 → Neo X",
  neo_x_to_neo_n3: "Neo X → Neo N3",
};

export function getChainLabel(chainId: ChainId): string {
  return CHAIN_LABELS[chainId];
}

export function getDirectionLabel(sourceChain: ChainId, destinationChain: ChainId): string {
  const key = `${sourceChain}_to_${destinationChain}` as BridgeDirection;
  return (
    DIRECTION_LABELS[key] ?? `${getChainLabel(sourceChain)} → ${getChainLabel(destinationChain)}`
  );
}

/**
 * Shorten a hex root/hash string for display.
 * Example: "0xabcdef1234567890abcd" → "0xabcd…90ab"
 */
export function shortenHash(hash: string, prefixLen = 6, suffixLen = 4): string {
  if (hash.length <= prefixLen + suffixLen + 2) return hash;
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
}

/**
 * Format an ISO timestamp to a locale-appropriate string.
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Return a human-readable relative time string, e.g. "3 min ago".
 */
export function relativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Unknown";

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Sync status display text. */
const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  synced: "Synced",
  out_of_sync: "Out of Sync",
  syncing: "Syncing",
  stale: "Stale",
  unknown: "Unknown",
};

export function getSyncStatusLabel(status: SyncStatus): string {
  return SYNC_STATUS_LABELS[status];
}

/** Generate a bridge slug from family + optional token symbol. */
export function getBridgeSlug(family: string, tokenSymbol?: string): string {
  if (tokenSymbol) {
    return `token-${tokenSymbol.toLowerCase()}`;
  }
  return family;
}

/** Format a nonce number for display. */
export function formatNonce(nonce: number): string {
  return nonce.toLocaleString("en-US");
}

/** Format a block number for display. */
export function formatBlockNumber(blockNumber: number | undefined): string {
  if (blockNumber === undefined) return "—";
  return `#${blockNumber.toLocaleString("en-US")}`;
}

/** Get the side label for source/destination. */
export function getSideLabel(side: "source" | "destination", state: BridgeSideState): string {
  return side === "source" ? `Source (nonce ${state.nonce})` : `Destination (nonce ${state.nonce})`;
}
