"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchAllBridgeOperationsViaClient,
  fetchIndexerStateViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildRows } from "../lib/bridge-history-rows";
import { buildBridgeLabel, parseBridgeSlug, parseDirectionSlug } from "../lib/bridge-slugs";
import { selectBridgeData } from "../lib/bridge-token-matching";
import { mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BridgeDirectionSlug } from "../lib/bridge-slugs";
import type { BackendBridgeOperation, BackendIndexerStateResponse } from "../types/backend-api";
import type { BridgeHistoryPageData } from "../types/bridge-history";

interface BridgeHistoryQueryData {
  history: BridgeHistoryPageData;
  statuses: ReturnType<typeof mapSyncInstancesToStatuses>;
  indexerState?: BackendIndexerStateResponse;
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
