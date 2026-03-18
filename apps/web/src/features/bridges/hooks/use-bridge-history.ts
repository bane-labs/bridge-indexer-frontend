"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import { fetchAllBridgeOperationsViaClient } from "../lib/backend-bridge-operations";
import { resolveTokenSymbol } from "../lib/bridge-operation-utils";
import { buildBridgeLabel, parseBridgeSlug } from "../lib/bridge-slugs";
import { mapOperationsToDirectionalStatuses } from "../lib/bridge-status-mapper";

import type { BackendBridgeOperation } from "../lib/backend-bridge-operations";
import type { BridgeHistoryPageData } from "../types/bridge-history";

type HistoryRow = BridgeHistoryPageData["directions"][number]["rows"][number];

interface BridgeHistoryQueryData {
  history: BridgeHistoryPageData;
  statuses: ReturnType<typeof mapOperationsToDirectionalStatuses>;
}

function buildRows(
  operations: BackendBridgeOperation[],
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
    }));
}

function mapOperationsToHistory(
  slug: string,
  operations: BackendBridgeOperation[]
): BridgeHistoryPageData | null {
  const parsed = parseBridgeSlug(slug);
  if (!parsed) {
    return null;
  }

  const filtered = operations.filter((op) => {
    if (parsed.bridgeFamily !== op.bridge_type) {
      return false;
    }

    if (parsed.bridgeFamily !== "token") {
      return true;
    }

    const tokenSymbol = resolveTokenSymbol(op.token_contract);
    return tokenSymbol?.toLowerCase() === parsed.tokenSymbol?.toLowerCase();
  });

  if (!filtered.length) {
    return null;
  }

  return {
    slug,
    bridgeFamily: parsed.bridgeFamily,
    tokenSymbol: parsed.tokenSymbol,
    label: buildBridgeLabel(parsed.bridgeFamily, parsed.tokenSymbol),
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        rows: buildRows(filtered, "deposit"),
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        rows: buildRows(filtered, "withdrawal"),
      },
    ],
  };
}

export function useBridgeHistory(slug: string) {
  const api = useApiClient();

  return useQuery<BridgeHistoryQueryData | null>({
    queryKey: ["bridge-history", slug],
    queryFn: async () => {
      const parsed = parseBridgeSlug(slug);
      if (!parsed) {
        return null;
      }

      const operations = await fetchAllBridgeOperationsViaClient(api, parsed.bridgeFamily);

      const history = mapOperationsToHistory(slug, operations);
      if (!history) {
        return null;
      }

      const statuses = mapOperationsToDirectionalStatuses(
        operations.filter((op) => {
          if (history.bridgeFamily !== "token") {
            return true;
          }
          const tokenSymbol = resolveTokenSymbol(op.token_contract);
          return tokenSymbol?.toLowerCase() === history.tokenSymbol?.toLowerCase();
        })
      );

      return { history, statuses };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
