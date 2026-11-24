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
  getTokenPairId,
  normalizeTokenContractAddress,
  operationMatchesTokenSlug,
  resolvedSyncInstanceTokenSymbol,
} from "../lib/bridge-token-matching";
import { mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BackendBridgeOperation } from "../types/backend-api";
import type { BridgeHistoryPageData } from "../types/bridge-history";

type HistoryRow = BridgeHistoryPageData["directions"][number]["rows"][number];

interface BridgeHistoryQueryData {
  history: BridgeHistoryPageData;
  statuses: ReturnType<typeof mapSyncInstancesToStatuses>;
}

function buildRows(
  operations: BackendBridgeOperation[],
  direction: "deposit" | "withdrawal"
): HistoryRow[] {
  return operations
    .filter((op) => op.direction === direction)
    .sort((a, b) => b.nonce - a.nonce)
    .map((op) => ({
      id: [op.bridge_type, direction, op.token_contract, op.dest_token_contract, op.nonce].join(
        ":"
      ),
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
  tokenSymbol?: string,
  tokenPairId?: string,
  combined = false
): BridgeHistoryPageData | null {
  const parsed = parseBridgeSlug(slug);
  if (!parsed) {
    return null;
  }

  return {
    slug,
    bridgeFamily: parsed.bridgeFamily,
    tokenSymbol,
    tokenPairId,
    label:
      buildBridgeLabel(parsed.bridgeFamily, tokenSymbol) + (combined ? " (all token pairs)" : ""),
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        rows: buildRows(operations, "deposit"),
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        rows: buildRows(operations, "withdrawal"),
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

      const selectedInstances = syncInstances.filter((instance) => {
        if (instance.bridge_type !== parsed.bridgeFamily) return false;
        if (parsed.bridgeFamily !== "token") return true;
        if (parsed.tokenPairId) {
          return (
            getTokenPairId(instance.src_chain, instance.src_token, instance.dst_token) ===
            parsed.tokenPairId
          );
        }
        if (parsed.instanceId) return instance.id === parsed.instanceId;
        return (
          resolvedSyncInstanceTokenSymbol(instance)?.toLowerCase() ===
          parsed.tokenSymbol?.toLowerCase()
        );
      });
      const selectedOperations = operations.filter((op) => {
        if (op.bridge_type !== parsed.bridgeFamily) return false;
        if (parsed.bridgeFamily !== "token") return true;
        if (parsed.tokenPairId) {
          return (
            getTokenPairId(op.source_chain, op.token_contract, op.dest_token_contract) ===
            parsed.tokenPairId
          );
        }
        if (parsed.instanceId) {
          return selectedInstances.some(
            (instance) =>
              instance.src_chain === op.source_chain &&
              instance.dst_chain === op.destination_chain &&
              normalizeTokenContractAddress(instance.src_token) ===
                normalizeTokenContractAddress(op.token_contract) &&
              normalizeTokenContractAddress(instance.dst_token) ===
                normalizeTokenContractAddress(op.dest_token_contract)
          );
        }
        return Boolean(
          parsed.tokenSymbol &&
            operationMatchesTokenSlug(op, parsed.tokenSymbol, contractsForTokenSymbol)
        );
      });
      const statuses = mapSyncInstancesToStatuses(selectedInstances);
      const pairCount = new Set(statuses.map((status) => status.tokenPairId ?? status.id)).size;
      const tokenSymbol =
        parsed.tokenSymbol ?? selectedInstances.map(resolvedSyncInstanceTokenSymbol).find(Boolean);
      const history = mapOperationsToHistory(
        slug,
        selectedOperations,
        tokenSymbol,
        parsed.tokenPairId,
        Boolean(parsed.tokenSymbol && pairCount > 1)
      );
      if (!history) return null;

      return { history, statuses };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
