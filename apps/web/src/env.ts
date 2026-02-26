/**
 * Environment Variables - Single Source of Truth
 *
 * This module provides typed, validated environment variable access for Atlas.
 * It uses @t3-oss/env-nextjs to ensure:
 * - Early validation (build/start time)
 * - Type safety
 * - Clear separation between server-only and client-exposed variables
 *
 * @module env
 *
 * @example Server-side usage (API routes, server components, middleware)
 * ```typescript
 * import { serverEnv } from '@/env';
 *
 * export async function GET() {
 *   const dbUrl = serverEnv.DATABASE_URL;
 *   // ...
 * }
 * ```
 *
 * @example Client-side usage (client components, browser code)
 * ```typescript
 * import { clientEnv } from '@/env';
 *
 * function MyComponent() {
 *   const apiUrl = clientEnv.NEXT_PUBLIC_API_URL;
 *   // ...
 * }
 * ```
 *
 * @see {@link file://./env/README.md} for detailed usage patterns
 * @see {@link file://../../docs/ENVIRONMENT_VARIABLES.md} for complete documentation
 */

import { env as clientEnvModule } from "./env/public-env";
import { env as serverEnvModule } from "./env/server-env";

/**
 * Client-side environment variables (NEXT_PUBLIC_* only).
 *
 * These variables are safe to use in browser code and will be
 * bundled into the client-side JavaScript.
 *
 * @security Only contains NEXT_PUBLIC_* variables - safe to expose
 */
export const clientEnv = clientEnvModule;

/**
 * Server-only environment variables.
 *
 * These variables are NEVER exposed to the client and can only be
 * used in server-side contexts (API routes, server components, middleware).
 *
 * @security Contains sensitive data - never import in client components
 */
export const serverEnv = serverEnvModule;

/**
 * Unified environment access (use with caution).
 *
 * For convenience when writing isomorphic code that runs on both
 * client and server. Be careful to only access appropriate variables
 * based on execution context.
 *
 * @example
 * ```typescript
 * import { env } from '@/env';
 *
 * // Safe - NEXT_PUBLIC_ vars work everywhere
 * const apiUrl = env.NEXT_PUBLIC_API_URL;
 *
 * // Unsafe - server vars only work server-side
 * const dbUrl = env.DATABASE_URL; // ⚠️ Will fail on client
 * ```
 *
 * @deprecated Prefer using `clientEnv` or `serverEnv` explicitly for clarity
 */
export const env = {
  ...clientEnvModule,
  ...serverEnvModule,
};
