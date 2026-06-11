import type { BridgeFamily, ChainId } from "../types/bridge";

/** URL segment representing a single bridge direction. */
export type BridgeDirectionSlug = "n3-to-x" | "x-to-n3";

/** Parse a direction URL segment into chain IDs and backend direction. */
export function parseDirectionSlug(
  slug: string
): {
  sourceChain: ChainId;
  destinationChain: ChainId;
  backendDirection: "deposit" | "withdrawal";
} | null {
  if (slug === "n3-to-x") {
    return { sourceChain: "neo_n3", destinationChain: "neo_x", backendDirection: "deposit" };
  }
  if (slug === "x-to-n3") {
    return { sourceChain: "neo_x", destinationChain: "neo_n3", backendDirection: "withdrawal" };
  }
  return null;
}

/** Build a direction URL segment from the source chain of a directional bridge. */
export function buildDirectionSlug(sourceChain: ChainId): BridgeDirectionSlug {
  return sourceChain === "neo_n3" ? "n3-to-x" : "x-to-n3";
}

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
  const familyLabelMap: Record<BridgeFamily, string> = {
    token: "Token",
    native: "Native",
    message: "Message",
  };
  const familyLabel = familyLabelMap[bridgeFamily];
  const chains = `${sourceLabel} → ${destinationLabel}`;

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
