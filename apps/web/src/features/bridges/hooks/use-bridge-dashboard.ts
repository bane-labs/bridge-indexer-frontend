"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import { fetchAllBridgeOperationsViaClient } from "../lib/backend-bridge-operations";
import { buildDashboardData } from "../lib/bridge-status";
import { mapOperationsToDirectionalStatuses } from "../lib/bridge-status-mapper";

import type { BridgeDashboardData } from "../types/bridge";

export function useBridgeDashboard() {
  const api = useApiClient();

  return useQuery<BridgeDashboardData>({
    queryKey: ["bridge-dashboard"],
    queryFn: async () => {
      const operations = await fetchAllBridgeOperationsViaClient(api);
      const statuses = mapOperationsToDirectionalStatuses(operations);

      return buildDashboardData(statuses);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
