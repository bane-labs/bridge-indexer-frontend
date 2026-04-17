import type {
  BackendBridgeOperation,
  BackendBridgeType,
  BackendDirectionalInstanceSync,
  BackendIndexerStateResponse,
  BackendOperationsResponse,
  BackendOverallHealth,
} from "../types/backend-api";

export type { BackendBridgeOperation, BackendBridgeType, BackendOperationsResponse };

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

    const payload = await api.get<BackendOperationsResponse>(`/operations?${params.toString()}`, {
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

/**
 * Fetches directional sync instances from the backend.
 */
export async function fetchSyncInstancesViaClient(
  api: BridgeOperationsApiClient
): Promise<BackendDirectionalInstanceSync[]> {
  return api.get<BackendDirectionalInstanceSync[]>("/sync/instances", { skipAuth: true });
}

/**
 * Fetches overall bridge health from the backend.
 */
export async function fetchHealthViaClient(
  api: BridgeOperationsApiClient
): Promise<BackendOverallHealth> {
  return api.get<BackendOverallHealth>("/health", { skipAuth: true });
}

/**
 * Fetches indexer state from the backend.
 */
export async function fetchIndexerStateViaClient(
  api: BridgeOperationsApiClient
): Promise<BackendIndexerStateResponse> {
  return api.get<BackendIndexerStateResponse>("/indexer/state", { skipAuth: true });
}
