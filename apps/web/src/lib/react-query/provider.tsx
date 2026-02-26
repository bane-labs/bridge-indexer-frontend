/**
 * React Query Provider
 *
 * Global QueryClient configuration with enterprise-grade defaults:
 * - Intelligent retry logic (only for transient failures)
 * - Exponential backoff for retries
 * - Disabled refetch on window focus (reduces noise)
 * - Sensible stale/cache times
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { isRetryableError } from "@/lib/api";

import type React from "react";

/**
 * Create a configured QueryClient instance.
 * Separated into a factory function for testing and SSR scenarios.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Default stale time: 60 seconds.
         * Data is considered fresh for 1 minute before automatic refetch.
         */
        staleTime: 60 * 1000,

        /**
         * Garbage collection time: 10 minutes.
         * Unused cached data is kept for 10 minutes before cleanup.
         */
        gcTime: 10 * 60 * 1000,

        /**
         * Disable refetch on window focus.
         * Reduces unnecessary API calls when users switch tabs.
         * Enable per-query if needed for real-time data.
         */
        refetchOnWindowFocus: false,

        /**
         * Disable refetch on mount if data is still fresh.
         * Reuses cached data within staleTime window.
         */
        refetchOnMount: false,

        /**
         * Disable refetch on reconnect if data is still fresh.
         */
        refetchOnReconnect: false,

        /**
         * Intelligent retry logic.
         * Only retry for transient failures (network errors, 502/503/504, 429).
         * Do NOT retry for client errors (400/401/403/404).
         */
        retry: (failureCount, error) => {
          // Never retry more than 3 times
          if (failureCount >= 3) {
            return false;
          }

          // Check if error is retryable using our API error utilities
          return isRetryableError(error);
        },

        /**
         * Exponential backoff with a cap.
         * Delay increases with each retry but doesn't exceed 30 seconds.
         */
        retryDelay: (attemptIndex) => {
          const baseDelay = 1000;
          const maxDelay = 30000;
          const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
          return delay;
        },
      },

      mutations: {
        /**
         * Mutations don't retry by default.
         * Enable retry per-mutation if safe (idempotent operations only).
         */
        retry: false,
      },
    },
  });
}

/**
 * React Query provider component.
 * Wraps the app with QueryClientProvider and manages client instance.
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  /**
   * Create QueryClient once per component lifecycle.
   * Using useState ensures it's created only once on mount.
   */
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
