import { fetchAllBridgeOperations, fetchSyncInstances } from "./bridge-operations-api";
import { buildBridgeLabel, parseBridgeSlug, parseDirectionSlug } from "./bridge-slugs";
import { selectBridgeData } from "./bridge-token-matching";

import type { BridgeHistoryPageData } from "../types/bridge-history";
import type { BridgeDirectionSlug } from "./bridge-slugs";

type HistoryRow = BridgeHistoryPageData["directions"][number]["rows"][number];

function buildRows(
  operations: Awaited<ReturnType<typeof fetchAllBridgeOperations>>,
  direction: "deposit" | "withdrawal"
): HistoryRow[] {
  return operations
    .filter((op) => op.direction === direction)
    .sort((a, b) => b.nonce - a.nonce)
    .map((op) => {
      const base = {
        id: [op.bridge_type, direction, op.token_contract, op.dest_token_contract, op.nonce].join(
          ":"
        ),
        nonce: op.nonce,
        root: op.root ?? "0x0",
        sourceTxHash: op.source_tx_hash,
        destinationTxHash: op.dest_tx_hash,
        amount: op.amount,
        fromAddress: op.from_address,
        toAddress: op.to_address,
      };

      if (op.status === "stuck") {
        if (op.claim_tx_hash) {
          return {
            ...base,
            status: "completed" as const,
            claimTxHash: op.claim_tx_hash,
            settledAt: op.completion_timestamp,
          };
        }
        return {
          ...base,
          status: "relayed" as const,
          settlementStatus:
            op.bridge_type === "message"
              ? ("waiting_for_execution" as const)
              : ("waiting_to_be_claimed" as const),
        };
      }

      if (op.status === "pending") {
        // Not yet indexed on the destination chain — no settlement action yet.
        return {
          ...base,
          status: "pending" as const,
        };
      }

      return {
        ...base,
        status: "completed" as const,
        settledAt: op.completion_timestamp,
      };
    });
}

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
