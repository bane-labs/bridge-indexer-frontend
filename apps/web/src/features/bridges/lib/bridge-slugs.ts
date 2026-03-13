import type { BridgeFamily, ChainId } from "../types/bridge";

/** Map a bridge slug back to its family and optional token symbol. */
export function parseBridgeSlug(
  slug: string
): { bridgeFamily: BridgeFamily; tokenSymbol?: string } | null {
  if (slug === "native") return { bridgeFamily: "native" };
  if (slug === "message") return { bridgeFamily: "message" };

  if (slug.startsWith("token-")) {
    const tokenSymbol = slug.slice("token-".length);
    if (tokenSymbol.length === 0) return null;
    return { bridgeFamily: "token", tokenSymbol: tokenSymbol.toUpperCase() };
  }

  return null;
}

/** Build a human-readable bridge label from parsed slug data. */
export function buildBridgeLabel(bridgeFamily: BridgeFamily, tokenSymbol?: string): string {
  if (tokenSymbol) return `${tokenSymbol} Token Bridge`;
  if (bridgeFamily === "native") return "Native Bridge";
  return "Message Bridge";
}

/** Build the page heading context line, e.g. "Token | Neo N3 ↔ Neo X | NEO". */
export function buildBridgeContext(
  bridgeFamily: BridgeFamily,
  sourceLabel: string,
  destinationLabel: string,
  tokenSymbol?: string
): string {
  const familyLabel =
    bridgeFamily === "token" ? "Token" : bridgeFamily === "native" ? "Native" : "Message";
  const chains = `${sourceLabel} ↔ ${destinationLabel}`;

  if (tokenSymbol) return `${familyLabel} | ${chains} | ${tokenSymbol}`;
  return `${familyLabel} | ${chains}`;
}

/**
 * All known bridge slugs for static generation / validation.
 * Extend as new bridges are added.
 */
export const KNOWN_BRIDGE_SLUGS = [
  "native",
  "message",
  "token-neo",
  "token-gas",
  "token-bneo",
  "token-fusdt",
] as const;

export type BridgeSlug = (typeof KNOWN_BRIDGE_SLUGS)[number];

/** Build a bridge slug from family + optional token symbol (re-exported convenience). */
export function getBridgeSlug(family: BridgeFamily, tokenSymbol?: string): string {
  if (tokenSymbol) return `token-${tokenSymbol.toLowerCase()}`;
  return family;
}

/** Chain ID ordering for consistent direction display. */
export const CHAIN_ORDER: ChainId[] = ["neo_n3", "neo_x"];
