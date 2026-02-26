/**
 * Environment variable barrel export.
 *
 * Re-exports validated environment configs with descriptive names
 * for use across the application.
 */

export { env as clientEnv } from "./public-env";
export { env as serverEnv } from "./server-env";
