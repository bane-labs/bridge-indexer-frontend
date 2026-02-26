"use client";

/**
 * Auth UI Components
 *
 * Pre-built components for OAuth authentication UI.
 * Integrates with the auth module's useSession hook.
 *
 * @module components/auth
 */

import { LogOut, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from "@atlas/ui";

import { useSession } from "@/lib/auth/useSession";

/**
 * Google icon SVG component.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Props for SignInButton component.
 */
export interface SignInButtonProps {
  /**
   * URL to redirect to after successful login.
   * Must be same-origin.
   */
  returnTo?: string;

  /**
   * Additional CSS classes.
   */
  className?: string;

  /**
   * Button variant.
   * @default "outline"
   */
  variant?: "default" | "outline" | "ghost";
}

/**
 * Sign In with Google button.
 *
 * Redirects to /api/auth/google/start to begin OAuth flow.
 *
 * @example
 * ```tsx
 * <SignInButton returnTo="/dashboard" />
 * ```
 */
export function SignInButton({ returnTo, className, variant = "outline" }: SignInButtonProps) {
  const handleSignIn = () => {
    const url = new URL("/api/auth/google/start", window.location.origin);
    if (returnTo) {
      url.searchParams.set("returnTo", returnTo);
    }
    window.location.href = url.toString();
  };

  return (
    <Button variant={variant} className={className} onClick={handleSignIn}>
      <GoogleIcon className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}

/**
 * Props for UserMenu component.
 */
export interface UserMenuProps {
  /**
   * Additional CSS classes for the trigger.
   */
  className?: string;
}

/**
 * User avatar dropdown menu with logout option.
 *
 * Shows user avatar and name with a dropdown for account actions.
 *
 * @example
 * ```tsx
 * <UserMenu />
 * ```
 */
export function UserMenu({ className }: UserMenuProps) {
  const { status, user, logout } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (status === "unauthenticated" || !user) {
    return <SignInButton className={className} />;
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${className || ""}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            {user.name && <p className="text-sm leading-none font-medium">{user.name}</p>}
            <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings" className="flex cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Props for AuthGuard component.
 */
export interface AuthGuardProps {
  /**
   * Content to render when authenticated.
   */
  children: React.ReactNode;

  /**
   * Content to render while loading.
   * @default Loading spinner
   */
  loading?: React.ReactNode;

  /**
   * Content to render when unauthenticated.
   * @default Sign in button
   */
  unauthenticated?: React.ReactNode;
}

/**
 * Client-side auth guard component.
 *
 * Renders children only when authenticated.
 *
 * Note: For server-side protection, use getServerSession() in
 * server components or middleware.
 *
 * @example
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children, loading, unauthenticated }: AuthGuardProps) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      loading || (
        <div className="flex items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )
    );
  }

  if (status === "unauthenticated") {
    return (
      unauthenticated || (
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-muted-foreground">Please sign in to continue</p>
          <SignInButton />
        </div>
      )
    );
  }

  return <>{children}</>;
}
