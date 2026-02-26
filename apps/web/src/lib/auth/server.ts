/**
 * Server Session Helper
 *
 * Provides session access for Server Components and API routes.
 * This module is server-only and should not be imported in client code.
 *
 * @module lib/auth/server
 */

import "server-only";

import { readSessionWithRefresh } from "./session";

import type { OAuthUser, SessionData, SessionResponse } from "./types";

/**
 * Get the current user session from cookies (server-side only).
 *
 * This function reads and validates the session cookie, automatically
 * refreshing the access token if needed.
 *
 * Use this in:
 * - Server Components
 * - API Route Handlers
 * - Server Actions
 * - Middleware
 *
 * @returns Session data or null if not authenticated
 *
 * @example Server Component
 * ```tsx
 * import { getServerSession } from '@/lib/auth/server';
 *
 * export default async function ProtectedPage() {
 *   const session = await getServerSession();
 *
 *   if (!session) {
 *     redirect('/login');
 *   }
 *
 *   return <div>Welcome, {session.user.name}!</div>;
 * }
 * ```
 *
 * @example API Route
 * ```typescript
 * import { getServerSession } from '@/lib/auth/server';
 *
 * export async function GET() {
 *   const session = await getServerSession();
 *
 *   if (!session) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 *
 *   // Use session.accessToken for backend API calls
 *   const data = await fetchFromBackend(session.accessToken);
 *   return Response.json(data);
 * }
 * ```
 */
export async function getServerSession(): Promise<SessionData | null> {
  return readSessionWithRefresh();
}

/**
 * Get the current user from the session (server-side only).
 *
 * Convenience wrapper that returns just the user object.
 *
 * @returns User data or null if not authenticated
 *
 * @example
 * ```tsx
 * import { getServerUser } from '@/lib/auth/server';
 *
 * export default async function Header() {
 *   const user = await getServerUser();
 *
 *   return (
 *     <header>
 *       {user ? <span>{user.email}</span> : <LoginLink />}
 *     </header>
 *   );
 * }
 * ```
 */
export async function getServerUser(): Promise<OAuthUser | null> {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Check if the user is authenticated (server-side only).
 *
 * Simple boolean check for authentication status.
 *
 * @returns true if authenticated, false otherwise
 *
 * @example
 * ```tsx
 * import { isAuthenticated } from '@/lib/auth/server';
 *
 * export default async function Page() {
 *   if (!(await isAuthenticated())) {
 *     redirect('/login');
 *   }
 *
 *   return <ProtectedContent />;
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return session !== null;
}

/**
 * Get session response for API endpoints (server-side only).
 *
 * Returns a client-safe session object without tokens.
 *
 * @returns Session response object
 */
export async function getServerSessionResponse(): Promise<SessionResponse> {
  const session = await getServerSession();

  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    },
    provider: session.user.provider,
  };
}

/**
 * Require authentication or throw.
 *
 * Use this when you need the session and want to handle the
 * unauthenticated case with an error.
 *
 * @returns Session data (guaranteed non-null)
 * @throws Error if not authenticated
 *
 * @example
 * ```tsx
 * import { requireSession } from '@/lib/auth/server';
 *
 * export default async function ProtectedPage() {
 *   // Throws if not authenticated
 *   const session = await requireSession();
 *
 *   return <div>Access token expires at: {session.accessTokenExpiresAt}</div>;
 * }
 * ```
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  return session;
}
