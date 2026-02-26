/**
 * Auth Module Barrel Export
 *
 * Public API for the auth module.
 *
 * @module lib/auth
 */

// Types
export type {
  OAuthProvider,
  OAuthTempState,
  OAuthUser,
  SessionData,
  SessionResponse,
} from "./types";

// Client-side hook
export type { SessionStatus, UseSessionReturn } from "./useSession";
export { useSession } from "./useSession";

// Note: Server-side utilities (session, providers) should be imported
// directly from their modules to avoid bundling server-only code:
// import { readSession } from '@/lib/auth/session';
// import { buildGoogleAuthUrl } from '@/lib/auth/providers/google';
