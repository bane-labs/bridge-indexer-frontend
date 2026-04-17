import { serverApiGet } from "@/lib/api/server";

import type {
  BackendBridgeOperation,
  BackendBridgeType,
  BackendDirectionalInstanceSync,
  BackendIndexerStateResponse,
  BackendOperationsResponse,
  BackendOverallHealth,
} from "../types/backend-api";

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

    const response = await serverApiGet<BackendOperationsResponse>(
      `/operations?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

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
 * Fetches directional sync instances from the backend (server-side).
 */
export async function fetchSyncInstances(): Promise<BackendDirectionalInstanceSync[]> {
  return serverApiGet<BackendDirectionalInstanceSync[]>("/sync/instances", {
    cache: "no-store",
  });
}

/**
 * Fetches overall bridge health from the backend (server-side).
 */
export async function fetchHealth(): Promise<BackendOverallHealth> {
  return serverApiGet<BackendOverallHealth>("/health", {
    cache: "no-store",
  });
}

/**
 * Fetches indexer state from the backend (server-side).
 */
export async function fetchIndexerState(): Promise<BackendIndexerStateResponse> {
  return serverApiGet<BackendIndexerStateResponse>("/indexer/state", {
    cache: "no-store",
  });
}
