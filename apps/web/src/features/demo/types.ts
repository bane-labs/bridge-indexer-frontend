/**
 * Demo API Client Types
 *
 * Type definitions for the demo API endpoints.
 * These would normally be generated from OpenAPI spec.
 *
 * @module features/demo/types
 */

export interface DemoItem {
  id: string;
  title: string;
  description?: string;
  status: "open" | "closed";
  createdAt: string;
}

export interface DemoItemsListResponse {
  data: DemoItem[];
  meta: {
    total: number;
    mode: string;
  };
}

export interface CreateDemoItemRequest {
  title: string;
  description?: string;
}

export interface UpdateDemoItemRequest {
  action?: "toggle";
  title?: string;
  description?: string;
  status?: "open" | "closed";
}

export type DemoMode = "success" | "empty" | "error" | "slow";
