"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/lib/api/hooks";

import {
  fetchHealthViaClient,
  fetchIndexerStateViaClient,
  fetchSyncInstancesViaClient,
} from "../lib/backend-bridge-operations";
import { buildDashboardData } from "../lib/bridge-status";
import { getOperationalHealth } from "../lib/operational-health";
import { mapSyncInstancesToStatuses } from "../lib/sync-instance-mapper";

import type { BridgeDashboardData } from "../types/bridge";

export function useBridgeDashboard() {
  const api = useApiClient();

  const { data: indexerState } = useQuery({
    queryKey: ["indexer-state"],
    queryFn: () => fetchIndexerStateViaClient(api),
    retry: false,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const dashboard = useQuery<BridgeDashboardData>({
    queryKey: ["bridge-dashboard"],
    queryFn: async () => {
      const [syncInstances, health] = await Promise.all([
        fetchSyncInstancesViaClient(api).catch(() => undefined),
        fetchHealthViaClient(api).catch(() => undefined),
      ]);

      const statuses = mapSyncInstancesToStatuses(syncInstances ?? []);
      const dashboard = buildDashboardData(statuses);

      dashboard.summary.health = getOperationalHealth(health);
      dashboard.syncUnavailable = syncInstances === undefined;

      return dashboard;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
  const chainLiveness = (
    [
      indexerState?.neo_n3
        ? {
            chain: "neo_n3" as const,
            lastBlockHeight: indexerState?.neo_n3.last_block_height,
            isSyncing: indexerState?.neo_n3.is_syncing,
            updatedAt: indexerState?.neo_n3.updated_at,
          }
        : null,
      indexerState?.neo_x
        ? {
            chain: "neo_x" as const,
            lastBlockHeight: indexerState?.neo_x.last_block_height,
            isSyncing: indexerState?.neo_x.is_syncing,
            updatedAt: indexerState?.neo_x.updated_at,
          }
        : null,
    ] as const
  ).filter((s): s is NonNullable<typeof s> => s !== null);

  return {
    ...dashboard,
    data: dashboard.data ? { ...dashboard.data, chainLiveness } : undefined,
  };
}
