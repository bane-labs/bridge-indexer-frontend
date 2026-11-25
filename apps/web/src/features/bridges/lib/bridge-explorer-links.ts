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

const HASH160 = /^(?:0x)?[0-9a-fA-F]{40}$/;
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Convert a backend N3 Hash160 (little-endian hex) to a Neo N3 account address. */
async function n3AddressFromHash(hash: string): Promise<string | undefined> {
  if (!globalThis.crypto?.subtle) return undefined;
  const hex = hash.replace(/^0x/i, "");
  const payload = Uint8Array.from([
    0x35,
    ...Array.from({ length: 20 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16)),
  ]);
  const first = await crypto.subtle.digest("SHA-256", payload);
  const second = new Uint8Array(await crypto.subtle.digest("SHA-256", first));
  const bytes = Uint8Array.from([...payload, ...second.slice(0, 4)]);
  let number = BigInt(
    `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`
  );
  let encoded = "";
  while (number > 0n) {
    encoded = BASE58_ALPHABET[Number(number % 58n)] + encoded;
    number /= 58n;
  }
  return encoded;
}

/** Return no link for malformed or unrecognized account representations. */
export async function getExplorerAddressUrl(
  chainId: ChainId,
  address: string
): Promise<string | undefined> {
  if (chainId === "neo_x") {
    if (!HASH160.test(address)) return undefined;
    return `https://xexplorer.neo.org/address/0x${address.replace(/^0x/i, "")}`;
  }
  // The current backend reports N3 event addresses as Hash160 values.
  // Other representations need independent validation before linking.
  if (!HASH160.test(address)) return undefined;
  const normalized = await n3AddressFromHash(address);
  return normalized ? `https://dora.coz.io/address/neo3/mainnet/${normalized}` : undefined;
}

/** Contracts have their own Dora route on N3; Neo X uses Blockscout address pages. */
export function getExplorerContractUrl(chainId: ChainId, contract: string): string | undefined {
  if (!HASH160.test(contract)) return undefined;
  const hash = `0x${contract.replace(/^0x/i, "")}`;
  return chainId === "neo_n3"
    ? `https://dora.coz.io/contract/neo3/mainnet/${hash}`
    : `https://xexplorer.neo.org/address/${hash}`;
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
