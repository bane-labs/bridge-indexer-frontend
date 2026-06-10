"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchAllBridgeOperationsViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildBridgeLabel, parseBridgeSlug } from "../lib/bridge-slugs";
import {
  collectTokenContractsForSymbol,
  operationMatchesTokenSlug,
} from "../lib/bridge-token-matching";
import { mapOperationsToDirectionalStatuses } from "../lib/bridge-status-mapper";

import type { BackendBridgeOperation } from "../types/backend-api";
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
      status: op.status,
      settlementStatus:
        op.status === "pending"
          ? op.bridge_type === "message"
            ? ("waiting for execution" as const)
            : ("claimable" as const)
          : undefined,
      amount: op.amount,
      fromAddress: op.from_address,
      toAddress: op.to_address,
    }));
}

function mapOperationsToHistory(
  slug: string,
  operations: BackendBridgeOperation[],
  contractsForTokenSymbol: Set<string>
): BridgeHistoryPageData | null {
  const parsed = parseBridgeSlug(slug);
  if (!parsed) {
    return null;
  }

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

      const [operations, syncInstances] = await Promise.all([
        fetchAllBridgeOperationsViaClient(api, parsed.bridgeFamily),
        fetchSyncInstancesViaClient(api),
      ]);

      const contractsForTokenSymbol =
        parsed.bridgeFamily === "token" && parsed.tokenSymbol
          ? collectTokenContractsForSymbol(syncInstances, parsed.tokenSymbol)
          : new Set<string>();

      const history = mapOperationsToHistory(slug, operations, contractsForTokenSymbol);
      if (!history) {
        return null;
      }

      const statuses = mapOperationsToDirectionalStatuses(
        operations.filter((op) => {
          if (history.bridgeFamily !== "token" || !history.tokenSymbol) {
            return true;
          }
          return operationMatchesTokenSlug(op, history.tokenSymbol, contractsForTokenSymbol);
        })
      );

      return { history, statuses };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
