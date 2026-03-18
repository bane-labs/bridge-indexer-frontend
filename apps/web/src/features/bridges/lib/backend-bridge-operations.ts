import type { BridgeFamily, ChainId } from "../types/bridge";

export type BackendBridgeType = BridgeFamily;
export type BackendDirection = "deposit" | "withdrawal";
export type BackendOperationStatus = "pending" | "completed" | "stuck";

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

export interface BridgeOperationsApiClient {
  get: <T>(
    endpoint: string,
    options?: {
      skipAuth?: boolean;
    }
  ) => Promise<T>;
}

/**
 * Fetches all bridge operations from the backend using pagination via the client API.
 */
export async function fetchAllBridgeOperationsViaClient(
  api: BridgeOperationsApiClient,
  bridgeType?: BackendBridgeType
): Promise<BackendBridgeOperation[]> {
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

    const payload = await api.get<OperationsResponse>(`/operations?${params.toString()}`, {
      skipAuth: true,
    });

    if (!payload.operations.length) {
      break;
    }

    all.push(...payload.operations);
    total = payload.total;
    offset += payload.operations.length;

    // Safety valve in case backend total is inconsistent.
    if (offset > 20000) {
      break;
    }
  }

  return all;
}
