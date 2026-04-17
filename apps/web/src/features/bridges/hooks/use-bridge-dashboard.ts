"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchHealthViaClient,
  fetchIndexerStateViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildDashboardData } from "../lib/bridge-status";
import { extractHealthSummary, mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BridgeDashboardData } from "../types/bridge";

export function useBridgeDashboard() {
  const api = useApiClient();

  return useQuery<BridgeDashboardData>({
    queryKey: ["bridge-dashboard"],
    queryFn: async () => {
      const [syncInstances, health, indexerState] = await Promise.all([
        fetchSyncInstancesViaClient(api),
        fetchHealthViaClient(api),
        fetchIndexerStateViaClient(api),
      ]);

      const statuses = mapSyncInstancesToStatuses(syncInstances, indexerState);
      const dashboard = buildDashboardData(statuses);

      const healthSummary = extractHealthSummary(health);
      dashboard.summary.healthStatus = healthSummary.healthStatus;
      dashboard.summary.pendingOperations = healthSummary.pendingOperations;
      dashboard.summary.stuckOperations = healthSummary.stuckOperations;

      return dashboard;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
