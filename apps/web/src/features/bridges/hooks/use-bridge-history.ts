"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchAllBridgeOperationsViaClient,
  fetchIndexerStateViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildBridgeLabel, parseBridgeSlug, parseDirectionSlug } from "../lib/bridge-slugs";
import { selectBridgeData } from "../lib/bridge-token-matching";
import { mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BridgeDirectionSlug } from "../lib/bridge-slugs";
import type { BackendBridgeOperation, BackendIndexerStateResponse } from "../types/backend-api";
import type { BridgeHistoryPageData } from "../types/bridge-history";

type HistoryRow = BridgeHistoryPageData["directions"][number]["rows"][number];

interface BridgeHistoryQueryData {
  history: BridgeHistoryPageData;
  statuses: ReturnType<typeof mapSyncInstancesToStatuses>;
  indexerState?: BackendIndexerStateResponse;
}

function buildRows(
  operations: BackendBridgeOperation[],
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
          // Relayed and subsequently claimed — show as completed with claim
          // tx link in the Settlement column.
          return {
            ...base,
            status: "completed" as const,
            claimTxHash: op.claim_tx_hash,
            settledAt: op.completion_timestamp,
          };
        }
        // Relayed, waiting for the user to claim (native/token) or the
        // message to be executed (message bridge).
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

      // completed — directly distributed, no separate claim step.
      return {
        ...base,
        status: "completed" as const,
        settledAt: op.completion_timestamp,
      };
    });
}

function mapOperationsToHistory(
  slug: string,
  directionSlug: BridgeDirectionSlug,
  operations: BackendBridgeOperation[],
  tokenSymbol?: string,
  tokenPairId?: string,
  combined = false
): BridgeHistoryPageData | null {
  const parsed = parseBridgeSlug(slug);
  const direction = parseDirectionSlug(directionSlug);
  if (!parsed || !direction) return null;

  return {
    slug,
    bridgeFamily: parsed.bridgeFamily,
    tokenSymbol,
    tokenPairId,
    label:
      buildBridgeLabel(parsed.bridgeFamily, tokenSymbol) + (combined ? " (all token pairs)" : ""),
    directions: [
      {
        sourceChain: direction.sourceChain,
        destinationChain: direction.destinationChain,
        rows: buildRows(operations, direction.backendDirection),
      },
    ],
  };
}

export function useBridgeHistory(slug: string, directionSlug: BridgeDirectionSlug) {
  const api = useApiClient();

  const { data: indexerState } = useQuery({
    queryKey: ["indexer-state"],
    queryFn: () => fetchIndexerStateViaClient(api),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const result = useQuery<BridgeHistoryQueryData | null>({
    queryKey: ["bridge-history", slug, directionSlug],
    queryFn: async () => {
      const parsed = parseBridgeSlug(slug);
      const direction = parseDirectionSlug(directionSlug);
      if (!parsed || !direction) {
        return null;
      }

      const [operations, syncInstances] = await Promise.all([
        fetchAllBridgeOperationsViaClient(api, parsed.bridgeFamily),
        fetchSyncInstancesViaClient(api),
      ]);

      const selection = selectBridgeData(parsed, operations, syncInstances);
      const statuses = mapSyncInstancesToStatuses(selection.instances).filter(
        (status) => status.sourceChain === direction.sourceChain
      );
      const history = mapOperationsToHistory(
        slug,
        directionSlug,
        selection.operations,
        selection.tokenSymbol,
        parsed.tokenPairId,
        selection.combined
      );
      if (!history) return null;

      return { history, statuses };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  return {
    ...result,
    data: result.data ? { ...result.data, indexerState } : result.data,
  };
}
