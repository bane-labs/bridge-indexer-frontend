import type { BridgeFamily, ChainId } from "../types/bridge";

/** Map a bridge slug back to its family and optional token symbol. */
export function parseBridgeSlug(slug: string): {
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  tokenPairId?: string;
  instanceId?: string;
} | null {
  if (slug === "native") return { bridgeFamily: "native" };
  if (slug === "message") return { bridgeFamily: "message" };

  if (slug.startsWith("token-pair-")) {
    const match = /^token-pair-([0-9a-f]+)-([0-9a-f]+)$/i.exec(slug);
    if (!match) return null;
    return { bridgeFamily: "token", tokenPairId: `${match[1]}:${match[2]}`.toLowerCase() };
  }
  if (slug.startsWith("token-instance-")) {
    try {
      const instanceId = decodeURIComponent(slug.slice("token-instance-".length));
      return instanceId ? { bridgeFamily: "token", instanceId } : null;
    } catch {
      return null;
    }
  }

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
  if (bridgeFamily === "token") return "Token Bridge";
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
export function getBridgeSlug(
  family: BridgeFamily,
  tokenSymbol?: string,
  tokenPairId?: string,
  instanceId?: string
): string {
  if (family !== "token") return family;
  if (tokenPairId) return `token-pair-${tokenPairId.replace(":", "-")}`;
  if (instanceId) return `token-instance-${encodeURIComponent(instanceId)}`;
  return tokenSymbol ? `token-${tokenSymbol.toLowerCase()}` : "token";
}

/** Chain ID ordering for consistent direction display. */
export const CHAIN_ORDER: ChainId[] = ["neo_n3", "neo_x"];
