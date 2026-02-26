"use client";

/**
 * Auth Demo Page
 *
 * Demonstrates Atlas authentication patterns:
 * - useSession hook for client-side session access
 * - Sign in/out with Google OAuth
 * - SSR-safe hydration (session hydrated from server)
 *
 * @module app/demo/auth/page
 */

import { CheckCircle, LogOut, RefreshCw, User, XCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@atlas/ui";

import { SignInButton, UserMenu } from "@/components/auth";
import { useSession } from "@/lib/auth/useSession";

import type { SessionResponse } from "@/lib/auth/types";

function SessionStatusBadge({
  status,
}: {
  status: "loading" | "authenticated" | "unauthenticated";
}) {
  switch (status) {
    case "loading":
      return <Badge variant="secondary">Loading...</Badge>;
    case "authenticated":
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <CheckCircle className="mr-1 h-3 w-3" />
          Authenticated
        </Badge>
      );
    case "unauthenticated":
      return (
        <Badge variant="outline">
          <XCircle className="mr-1 h-3 w-3" />
          Not authenticated
        </Badge>
      );
  }
}

/**
 * Session content component to avoid nested ternaries
 */
function SessionContent({
  status,
  user,
  provider,
}: {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionResponse["user"] | null;
  provider: SessionResponse["provider"] | null;
}) {
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} />
          <AvatarFallback className="text-lg">
            {user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{user.name || "Unknown"}</p>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {provider && (
            <p className="text-muted-foreground text-xs">
              via <span className="capitalize">{provider}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-dashed p-6">
      <User className="text-muted-foreground h-12 w-12" />
      <div>
        <p className="font-medium">Not signed in</p>
        <p className="text-muted-foreground text-sm">Sign in with Google to see session data</p>
      </div>
    </div>
  );
}

export default function AuthDemoPage() {
  const { status, user, provider, refresh, logout } = useSession();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Authentication Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates Google OAuth with SSR-safe session handling using the Atlas auth module.
        </p>
      </div>

      {/* Current Session State */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Session</CardTitle>
              <CardDescription>Live session state from useSession() hook</CardDescription>
            </div>
            <SessionStatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionContent status={status} user={user} provider={provider} />

          {/* Actions */}
          <div className="flex items-center gap-3 border-t pt-4">
            {status === "unauthenticated" && <SignInButton returnTo="/demo/auth" />}
            {status === "authenticated" && (
              <>
                <Button variant="outline" onClick={refresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Session
                </Button>
                <Button variant="destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UserMenu Component Demo */}
      <Card>
        <CardHeader>
          <CardTitle>UserMenu Component</CardTitle>
          <CardDescription>Pre-built dropdown menu component for user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm">Click the avatar to see the menu:</span>
            <UserMenu />
          </div>
        </CardContent>
      </Card>

      {/* SSR Note */}
      <Alert>
        <AlertTitle>SSR-Safe Pattern</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          The session is fetched from <code className="text-xs">/api/auth/me</code> on mount. During
          SSR, the session is not available to prevent hydration mismatches. Use{" "}
          <code className="text-xs">getServerSession()</code> in Server Components for server-side
          session access.
        </AlertDescription>
      </Alert>

      {/* Implementation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
          <CardDescription>Key patterns demonstrated on this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">useSession() hook</p>
              <p className="text-muted-foreground">
                Client-side hook that fetches session from /api/auth/me
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">SignInButton component</p>
              <p className="text-muted-foreground">
                Redirects to OAuth flow with PKCE and returnTo support
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">UserMenu component</p>
              <p className="text-muted-foreground">
                Pre-built avatar dropdown with sign out action
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">Encrypted session cookies</p>
              <p className="text-muted-foreground">
                Tokens stored in httpOnly cookies with AES-GCM encryption
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
