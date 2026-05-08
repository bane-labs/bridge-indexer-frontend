import { fetchAllBridgeOperations, fetchSyncInstances } from "./bridge-operations-api";
import { parseBridgeSlug } from "./bridge-slugs";
import { collectTokenContractsForSymbol, operationMatchesTokenSlug } from "./bridge-token-matching";

import type { ChainId } from "../types/bridge";
import type { BridgeHistoryPageData } from "../types/bridge-history";

type HistoryRow = BridgeHistoryPageData["directions"][number]["rows"][number];

function directionChains(direction: "deposit" | "withdrawal"): {
  sourceChain: ChainId;
  destinationChain: ChainId;
} {
  if (direction === "deposit") {
    return { sourceChain: "neo_n3", destinationChain: "neo_x" };
  }
  return { sourceChain: "neo_x", destinationChain: "neo_n3" };
}

function buildRows(
  operations: Awaited<ReturnType<typeof fetchAllBridgeOperations>>,
  direction: "deposit" | "withdrawal"
): HistoryRow[] {
  return operations
    .filter((op) => op.direction === direction)
    .sort((a, b) => b.nonce - a.nonce)
    .map((op) => ({
      id: `${op.bridge_type}-${direction}-${op.nonce}`,
      nonce: op.nonce,
      root: op.root ?? "0x0",
      sourceTxHash: op.source_tx_hash,
      destinationTxHash: op.dest_tx_hash,
      settledAt: op.completion_timestamp,
      status: op.status,
      amount: op.amount,
      fromAddress: op.from_address,
      toAddress: op.to_address,
    }));
}

/**
 * Fetch bridge history data for a given slug from real backend operations.
 */
export async function getBridgeHistory(slug: string): Promise<BridgeHistoryPageData | null> {
  const parsed = parseBridgeSlug(slug);
  if (!parsed) {
    return null;
  }

  const [operations, syncInstances] = await Promise.all([
    fetchAllBridgeOperations(parsed.bridgeFamily),
    fetchSyncInstances(),
  ]);

  const contractsForTokenSymbol =
    parsed.bridgeFamily === "token" && parsed.tokenSymbol
      ? collectTokenContractsForSymbol(syncInstances, parsed.tokenSymbol)
      : new Set<string>();

  const filtered = operations.filter((op) => {
    if (parsed.bridgeFamily !== op.bridge_type) {
      return false;
    }

    if (parsed.bridgeFamily !== "token" || !parsed.tokenSymbol) {
      return true;
    }

    return operationMatchesTokenSlug(op, parsed.tokenSymbol, contractsForTokenSymbol);
  });

  if (!filtered.length) {
    return null;
  }

  const depositChains = directionChains("deposit");
  const withdrawalChains = directionChains("withdrawal");

  const depositRows = buildRows(filtered, "deposit");
  const withdrawalRows = buildRows(filtered, "withdrawal");

  let label: string;
  if (parsed.tokenSymbol) {
    label = `${parsed.tokenSymbol} Token Bridge`;
  } else if (parsed.bridgeFamily === "native") {
    label = "Native Bridge";
  } else {
    label = "Message Bridge";
  }

  return {
    slug,
    bridgeFamily: parsed.bridgeFamily,
    tokenSymbol: parsed.tokenSymbol,
    label,
    directions: [
      {
        sourceChain: depositChains.sourceChain,
        destinationChain: depositChains.destinationChain,
        rows: depositRows,
      },
      {
        sourceChain: withdrawalChains.sourceChain,
        destinationChain: withdrawalChains.destinationChain,
        rows: withdrawalRows,
      },
    ],
  };
}
