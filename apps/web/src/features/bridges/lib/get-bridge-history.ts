import { buildRows } from "./bridge-history-rows";
import { fetchAllBridgeOperations, fetchSyncInstances } from "./bridge-operations-api";
import { buildBridgeLabel, parseBridgeSlug, parseDirectionSlug } from "./bridge-slugs";
import { selectBridgeData } from "./bridge-token-matching";

import type { BridgeHistoryPageData } from "../types/bridge-history";
import type { BridgeDirectionSlug } from "./bridge-slugs";

/**
 * Fetch bridge history data for a given slug and direction from real backend operations.
 */
export async function getBridgeHistory(
  slug: string,
  directionSlug: BridgeDirectionSlug
): Promise<BridgeHistoryPageData | null> {
  const parsed = parseBridgeSlug(slug);
  if (!parsed) {
    return null;
  }

  const [operations, syncInstances] = await Promise.all([
    fetchAllBridgeOperations(parsed.bridgeFamily),
    fetchSyncInstances(),
  ]);

  const selection = selectBridgeData(parsed, operations, syncInstances);

  const direction = parseDirectionSlug(directionSlug);
  if (!direction) {
    return null;
  }

  const rows = buildRows(selection.operations, direction.backendDirection);

  return {
    slug,
    bridgeFamily: parsed.bridgeFamily,
    tokenSymbol: selection.tokenSymbol,
    tokenPairId: parsed.tokenPairId,
    label:
      buildBridgeLabel(parsed.bridgeFamily, selection.tokenSymbol) +
      (selection.combined ? " (all token pairs)" : ""),
    directions: [
      {
        sourceChain: direction.sourceChain,
        destinationChain: direction.destinationChain,
        rows,
      },
    ],
  };
}
