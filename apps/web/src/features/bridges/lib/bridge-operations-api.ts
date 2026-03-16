import { serverApiGet } from "@/lib/api/server";

import type { BridgeFamily, ChainId } from "../types/bridge";

type BackendBridgeType = BridgeFamily;
type BackendDirection = "deposit" | "withdrawal";
type BackendOperationStatus = "pending" | "completed" | "stuck";

export interface BackendBridgeOperation {
  bridge_type: BackendBridgeType;
  direction: BackendDirection;
  nonce: number;
  source_chain: ChainId;
  destination_chain: ChainId;
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

const TOKEN_CONTRACT_SYMBOLS: Record<string, string> = {
  // Add known contract-to-symbol mappings here when available.
};

/**
 * Fetches all bridge operations from the backend using pagination.
 */
export async function fetchAllBridgeOperations(bridgeType?: BackendBridgeType) {
  const pageSize = 500;
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;
  const all: BackendBridgeOperation[] = [];

  while (offset < total) {
    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
    });

    if (bridgeType) {
      params.set("bridge_type", bridgeType);
    }

    const response = await serverApiGet<OperationsResponse>(`/operations?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.operations.length) {
      break;
    }

    all.push(...response.operations);
    total = response.total;
    offset += response.operations.length;

    // Safety valve in case backend total is inconsistent.
    if (offset > 20000) {
      break;
    }
  }

  return all;
}

/**
 * Resolve token symbol from contract address with a deterministic fallback.
 */
export function resolveTokenSymbol(tokenContract?: string): string | undefined {
  if (!tokenContract) {
    return undefined;
  }

  const normalized = tokenContract.toLowerCase();
  if (TOKEN_CONTRACT_SYMBOLS[normalized]) {
    return TOKEN_CONTRACT_SYMBOLS[normalized];
  }

  const compact = normalized.startsWith("0x") ? normalized.slice(2) : normalized;
  return compact.slice(0, 6).toUpperCase();
}
