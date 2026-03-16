import { fetchAllBridgeOperations, resolveTokenSymbol } from "./bridge-operations-api";

import { buildDashboardData, deriveSyncStatus, isDataStale } from "./bridge-status";

import type { BridgeDashboardData } from "../types/bridge";
import type { DirectionalBridgeStatus } from "../types/bridge";

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
    status: "pending" | "completed" | "stuck";
  }>;
}

const EMPTY_ROOT = "0x0";

function groupOperationsByDirection(
  operations: Awaited<ReturnType<typeof fetchAllBridgeOperations>>
): OperationGroup[] {
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

/**
 * Fetch bridge dashboard data from backend operations.
 */
export async function getBridgeDashboard(): Promise<BridgeDashboardData> {
  const operations = await fetchAllBridgeOperations();
  const groups = groupOperationsByDirection(operations);
  const statuses = groups
    .map(mapGroupToStatus)
    .filter((status): status is DirectionalBridgeStatus => Boolean(status));

  return buildDashboardData(statuses);
}
