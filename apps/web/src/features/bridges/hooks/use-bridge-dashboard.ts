"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import { resolveTokenSymbol } from "../lib/bridge-operation-utils";
import { buildDashboardData, deriveSyncStatus, isDataStale } from "../lib/bridge-status";

import type { BridgeDashboardData, DirectionalBridgeStatus } from "../types/bridge";

type BackendBridgeType = "native" | "token" | "message";
type BackendDirection = "deposit" | "withdrawal";
type BackendOperationStatus = "pending" | "completed" | "stuck";

interface BackendBridgeOperation {
  bridge_type: BackendBridgeType;
  direction: BackendDirection;
  nonce: number;
  source_chain: DirectionalBridgeStatus["sourceChain"];
  destination_chain: DirectionalBridgeStatus["destinationChain"];
  source_block_height: number;
  dest_block_height?: number;
  source_tx_hash: string;
  dest_tx_hash?: string;
  token_contract?: string;
  root?: string;
  timestamp: string;
  completion_timestamp?: string;
  status: BackendOperationStatus;
}

interface OperationsResponse {
  operations: BackendBridgeOperation[];
  total: number;
}

interface OperationGroup {
  bridgeFamily: DirectionalBridgeStatus["bridgeFamily"];
  tokenSymbol?: string;
  sourceChain: DirectionalBridgeStatus["sourceChain"];
  destinationChain: DirectionalBridgeStatus["destinationChain"];
  operations: Array<{
    nonce: number;
    root?: string;
    sourceBlockHeight: number;
    destBlockHeight?: number;
    timestamp: string;
    completionTimestamp?: string;
    status: BackendOperationStatus;
  }>;
}

const EMPTY_ROOT = "0x0";

function groupOperationsByDirection(operations: BackendBridgeOperation[]): OperationGroup[] {
  const groups = new Map<string, OperationGroup>();

  for (const op of operations) {
    const tokenSymbol =
      op.bridge_type === "token" ? resolveTokenSymbol(op.token_contract) : undefined;
    const key = [op.bridge_type, tokenSymbol ?? "", op.source_chain, op.destination_chain].join(
      "|"
    );

    const existing = groups.get(key);
    if (existing) {
      existing.operations.push({
        nonce: op.nonce,
        root: op.root,
        sourceBlockHeight: op.source_block_height,
        destBlockHeight: op.dest_block_height,
        timestamp: op.timestamp,
        completionTimestamp: op.completion_timestamp,
        status: op.status,
      });
      continue;
    }

    groups.set(key, {
      bridgeFamily: op.bridge_type,
      tokenSymbol,
      sourceChain: op.source_chain,
      destinationChain: op.destination_chain,
      operations: [
        {
          nonce: op.nonce,
          root: op.root,
          sourceBlockHeight: op.source_block_height,
          destBlockHeight: op.dest_block_height,
          timestamp: op.timestamp,
          completionTimestamp: op.completion_timestamp,
          status: op.status,
        },
      ],
    });
  }

  return Array.from(groups.values());
}

function mapGroupToStatus(group: OperationGroup): DirectionalBridgeStatus | null {
  const latestSource = [...group.operations].sort((a, b) => b.nonce - a.nonce)[0];
  if (!latestSource) {
    return null;
  }

  const latestCompleted = [...group.operations]
    .filter((op) => op.status === "completed")
    .sort((a, b) => b.nonce - a.nonce)[0];

  const destinationNonce = latestCompleted?.nonce ?? 0;
  const destinationRoot = latestCompleted?.root ?? EMPTY_ROOT;
  const destinationUpdatedAt = latestCompleted?.completionTimestamp ?? latestSource.timestamp;

  const source = {
    nonce: latestSource.nonce,
    root: latestSource.root ?? EMPTY_ROOT,
    blockNumber: latestSource.sourceBlockHeight,
    updatedAt: latestSource.timestamp,
  };

  const destination = {
    nonce: destinationNonce,
    root: destinationRoot,
    blockNumber: latestCompleted?.destBlockHeight,
    updatedAt: destinationUpdatedAt,
  };

  const syncStatus = deriveSyncStatus(source, destination);
  const lastUpdatedAt =
    new Date(source.updatedAt) > new Date(destination.updatedAt)
      ? source.updatedAt
      : destination.updatedAt;

  return {
    id: `${group.bridgeFamily}${group.tokenSymbol ? `-${group.tokenSymbol.toLowerCase()}` : ""}-${group.sourceChain}-to-${group.destinationChain}`,
    bridgeFamily: group.bridgeFamily,
    tokenSymbol: group.tokenSymbol,
    sourceChain: group.sourceChain,
    destinationChain: group.destinationChain,
    source,
    destination,
    syncStatus,
    isStale: isDataStale(lastUpdatedAt),
    lastUpdatedAt,
  };
}

export function useBridgeDashboard() {
  const api = useApiClient();

  return useQuery<BridgeDashboardData>({
    queryKey: ["bridge-dashboard"],
    queryFn: async () => {
      const pageSize = 500;
      let offset = 0;
      let total = Number.POSITIVE_INFINITY;
      const all: BackendBridgeOperation[] = [];

      while (offset < total) {
        const payload = await api.get<OperationsResponse>(
          `/operations?limit=${pageSize}&offset=${offset}`,
          { skipAuth: true }
        );

        if (!payload.operations.length) {
          break;
        }

        all.push(...payload.operations);
        total = payload.total;
        offset += payload.operations.length;

        if (offset > 20000) {
          break;
        }
      }

      const groups = groupOperationsByDirection(all);
      const statuses = groups
        .map(mapGroupToStatus)
        .filter((status): status is DirectionalBridgeStatus => Boolean(status));

      return buildDashboardData(statuses);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
