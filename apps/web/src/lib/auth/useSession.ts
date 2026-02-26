"use client";

/**
 * useSession Hook
 *
 * Client-side hook for accessing session state.
 * Fetches session from /api/auth/me and provides reactive state.
 *
 * @module lib/auth/useSession
 */

import { useCallback, useEffect, useState } from "react";

import type { SessionResponse } from "./types";

/**
 * Session status states.
 */
export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

/**
 * Session hook return value.
 */
export interface UseSessionReturn {
  /**
   * Current session status.
   */
  status: SessionStatus;

  /**
   * User information (only present when authenticated).
   */
  user: SessionResponse["user"] | null;

  /**
   * OAuth provider (only present when authenticated).
   */
  provider: SessionResponse["provider"] | null;

  /**
   * Refresh session data from server.
   */
  refresh: () => Promise<void>;

  /**
   * Logout and clear session.
   */
  logout: () => Promise<void>;
}

/**
 * Hook for accessing session state on the client.
 *
 * Fetches session on mount and provides methods to refresh/logout.
 *
 * @example
 * ```tsx
 * function UserMenu() {
 *   const { status, user, logout } = useSession();
 *
 *   if (status === 'loading') return <Spinner />;
 *   if (status === 'unauthenticated') return <LoginButton />;
 *
 *   return (
 *     <div>
 *       <span>{user.name}</span>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<SessionResponse["user"] | null>(null);
  const [provider, setProvider] = useState<SessionResponse["provider"] | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch session");
      }

      const data: SessionResponse = await response.json();

      if (data.authenticated && data.user) {
        setStatus("authenticated");
        setUser(data.user);
        setProvider(data.provider || null);
      } else {
        setStatus("unauthenticated");
        setUser(null);
        setProvider(null);
      }
    } catch {
      setStatus("unauthenticated");
      setUser(null);
      setProvider(null);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setStatus("unauthenticated");
      setUser(null);
      setProvider(null);
    }
  }, []);

  // Fetch session on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status,
    user,
    provider,
    refresh,
    logout,
  };
}
