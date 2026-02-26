import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Request context that flows through async operations
 */
export interface RequestContext {
  requestId: string;
  route?: string;
  method?: string;
  userId?: string;
  tenantId?: string;
}

/**
 * AsyncLocalStorage instance for request-scoped context
 */
const requestContextStore = new AsyncLocalStorage<RequestContext>();

/**
 * Run a function within a request context
 * All async operations within `fn` will have access to this context
 */
export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return requestContextStore.run(ctx, fn);
}

/**
 * Get the current request context
 * Returns undefined if called outside a request context
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStore.getStore();
}
