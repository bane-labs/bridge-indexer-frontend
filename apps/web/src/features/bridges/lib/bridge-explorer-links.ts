import type { ChainId } from "../types/bridge";

/**
 * Block explorer base URLs for each chain.
 * Replace with real explorer URLs when available.
 */
const EXPLORER_TX_URLS: Record<ChainId, string> = {
  neo_n3: "https://dora.coz.io/transaction/neo3/mainnet",
  neo_x: "https://xexplorer.neo.org/tx",
};

/**
 * Some explorers require a specific prefix on the tx hash in the URL.
 * Neo N3's Dora explorer requires the "0x" prefix.
 */
const EXPLORER_TX_HASH_PREFIX: Record<ChainId, string> = {
  neo_n3: "0x",
  neo_x: "",
};

/** Build a block explorer transaction URL for a given chain + tx hash. */
export function getExplorerTxUrl(chainId: ChainId, txHash: string): string {
  const prefix = EXPLORER_TX_HASH_PREFIX[chainId];
  const hash = txHash.startsWith(prefix) ? txHash : `${prefix}${txHash}`;
  return `${EXPLORER_TX_URLS[chainId]}/${hash}`;
}

/** Short display labels for chain explorer badges. */
const EXPLORER_LABELS: Record<ChainId, string> = {
  neo_n3: "N3 Explorer",
  neo_x: "Neo X Explorer",
};

/** Get the explorer badge label for a chain. */
export function getExplorerLabel(chainId: ChainId): string {
  return EXPLORER_LABELS[chainId];
}

/** Short chain badge text for inline use. */
const CHAIN_BADGE_LABELS: Record<ChainId, string> = {
  neo_n3: "N3",
  neo_x: "X",
};

/** Get short badge text for a chain. */
export function getChainBadgeLabel(chainId: ChainId): string {
  return CHAIN_BADGE_LABELS[chainId];
}
