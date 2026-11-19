"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchHealthViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildDashboardData } from "../lib/bridge-status";
import { getOperationalHealth } from "../lib/operational-health";
import { mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BridgeDashboardData } from "../types/bridge";

export function useBridgeDashboard() {
  const api = useApiClient();

  return useQuery<BridgeDashboardData>({
    queryKey: ["bridge-dashboard"],
    queryFn: async () => {
      const [syncInstances, health] = await Promise.all([
        fetchSyncInstancesViaClient(api),
        fetchHealthViaClient(api).catch(() => undefined),
      ]);

      const statuses = mapSyncInstancesToStatuses(syncInstances);
      const dashboard = buildDashboardData(statuses);

      dashboard.summary.health = getOperationalHealth(health);

      return dashboard;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
