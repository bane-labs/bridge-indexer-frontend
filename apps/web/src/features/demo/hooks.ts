/**
 * Demo API React Query Hooks
 *
 * React Query hooks for the demo API endpoints.
 * Demonstrates proper query key patterns, mutations, and invalidation.
 *
 * Uses the central API client from @/lib/api for consistent error handling,
 * correlation ID propagation, and retry logic.
 *
 * @module features/demo/hooks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { createQueryKeys } from "@/lib/react-query/keys";

import type { CreateDemoItemRequest, DemoItem, DemoItemsListResponse, DemoMode } from "./types";

// Query key factory for demo items
export const demoItemsKeys = createQueryKeys("demo-items");

/**
 * Hook to fetch demo items with mode switching.
 *
 * @param mode - The demo mode (success, empty, error, slow)
 */
export function useDemoItems(mode: DemoMode = "success") {
  return useQuery({
    queryKey: demoItemsKeys.list({ mode }),
    queryFn: async () => {
      return apiGet<DemoItemsListResponse>(`/api/demo/items?mode=${mode}`, {
        skipAuth: true,
        skipRetry: mode === "error", // Don't retry on error mode - it's intentional
      });
    },
    // Don't retry on error mode - it's intentional
    retry: mode === "error" ? false : 2,
    // Keep previous data while fetching to reduce flickering
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to create a new demo item.
 */
export function useCreateDemoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDemoItemRequest) => {
      return apiPost<DemoItem>("/api/demo/items", data, { skipAuth: true });
    },
    onSuccess: () => {
      // Invalidate all list queries to refresh
      queryClient.invalidateQueries({ queryKey: demoItemsKeys.lists() });
    },
  });
}

/**
 * Hook to toggle demo item status.
 */
export function useToggleDemoItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiPatch<DemoItem>(`/api/demo/items/${id}`, { action: "toggle" }, { skipAuth: true });
    },
    // Optimistic update for better UX
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: demoItemsKeys.lists() });

      // Snapshot previous value for rollback
      const previousQueries = queryClient.getQueriesData<DemoItemsListResponse>({
        queryKey: demoItemsKeys.lists(),
      });

      // Optimistically update matching queries
      queryClient.setQueriesData<DemoItemsListResponse>(
        { queryKey: demoItemsKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === id
                ? { ...item, status: item.status === "open" ? "closed" : "open" }
                : item
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: demoItemsKeys.lists() });
    },
  });
}
