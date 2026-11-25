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
  historyLoading: boolean;
  historyError: boolean;
  stateLoading: boolean;
  stateError: boolean;
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

  const parsed = parseBridgeSlug(slug);
  const direction = parseDirectionSlug(directionSlug);
  const operations = useQuery({
    queryKey: ["bridge-operations", slug],
    queryFn: () => fetchAllBridgeOperationsViaClient(api, parsed?.bridgeFamily),
    enabled: Boolean(parsed && direction),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
  });
  const sync = useQuery({
    queryKey: ["bridge-sync-instances"],
    queryFn: () => fetchSyncInstancesViaClient(api),
    enabled: Boolean(parsed && direction),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
  });
  let data: BridgeHistoryQueryData | null | undefined;
  if (!parsed || !direction) {
    data = null;
  } else if (!operations.isPending || !sync.isPending) {
    const selection = selectBridgeData(parsed, operations.data ?? [], sync.data ?? []);
    const history = mapOperationsToHistory(
      slug,
      directionSlug,
      selection.operations,
      selection.tokenSymbol,
      parsed.tokenPairId,
      selection.combined
    );
    data = history
      ? {
          history,
          // Show both directions of the selected bridge; operation history stays
          // scoped to the requested direction.
          statuses: mapSyncInstancesToStatuses(selection.instances),
          indexerState,
          historyLoading: operations.isPending,
          historyError: operations.isError,
          stateLoading: sync.isPending,
          stateError: sync.isError,
        }
      : null;
  }
  return {
    data,
    isLoading: operations.isPending && sync.isPending,
    isError: operations.isError && sync.isError,
  };
}
