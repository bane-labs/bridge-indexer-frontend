# OAuth Authentication

Atlas implements OAuth 2.0 authentication using the Authorization Code flow with PKCE (Proof Key for
Code Exchange). This document covers the implementation details, security considerations, and usage
patterns.

## Overview

### Why Authorization Code + PKCE?

- **Authorization Code Flow**: The most secure OAuth flow for web applications. The client never
  handles the user's credentials, and the access token is obtained through a server-side exchange.
- **PKCE (RFC 7636)**: Adds an additional layer of security by binding the authorization request to
  the token exchange request, preventing authorization code interception attacks.

### Security Principles

1. **No tokens in localStorage**: Tokens are stored in encrypted httpOnly cookies, inaccessible to
   JavaScript
2. **No implicit flow**: We use authorization code flow exclusively
3. **Server-side token exchange**: All token operations happen on the server
4. **Refresh tokens protected**: Never exposed to client-side code
5. **CSRF protection**: State parameter validation in OAuth flow

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Browser       │────▶│   Next.js       │────▶│   Google        │
│   (Client)      │     │   (Server)      │     │   OAuth         │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │
       │ useSession()           │ Encrypted
       │ (fetch /api/auth/me)   │ Session Cookie
       │                        │
       ▼                        ▼
  ┌─────────────────────────────────────────┐
  │           Session Cookie                 │
  │  - httpOnly (no JS access)              │
  │  - Secure (HTTPS only in prod)          │
  │  - SameSite=Lax (CSRF protection)       │
  │  - AES-GCM encrypted                    │
  └─────────────────────────────────────────┘
```

## Token Storage

Tokens are stored in an encrypted session cookie:

| Data          | Storage                    | Client Access            |
| ------------- | -------------------------- | ------------------------ |
| Access Token  | Session cookie (encrypted) | ❌ No                    |
| Refresh Token | Session cookie (encrypted) | ❌ No                    |
| User Info     | Session cookie (encrypted) | ✅ Via /api/auth/me only |

### Cookie Properties

```typescript
{
  httpOnly: true,        // No JavaScript access
  secure: true,          // HTTPS only (production)
  sameSite: 'lax',       // CSRF protection
  path: '/',             // Available site-wide
  maxAge: sessionTTL     // Configurable TTL
}
```

## Session Lifecycle

### Login Flow

1. User clicks "Sign in with Google"
2. Client navigates to `/api/auth/google/start`
3. Server generates PKCE verifier/challenge and state
4. Server stores verifier + state in temporary cookie
5. Server redirects to Google authorization page
6. User authenticates with Google
7. Google redirects to `/api/auth/google/callback` with code
8. Server validates state parameter (CSRF check)
9. Server exchanges code for tokens (with PKCE verifier)
10. Server fetches user info from Google
11. Server creates encrypted session cookie
12. Server redirects to app

### Session Refresh

Access tokens expire (typically after 1 hour). The server automatically refreshes them:

- **Proactive refresh**: When access token expires within 2 minutes
- **On-demand refresh**: When reading session via `readSessionWithRefresh()`
- **Manual refresh**: POST to `/api/auth/refresh`

```typescript
// Refresh happens automatically in session reads
const session = await getServerSession();
// If token was expiring, it's now refreshed
```

### Logout Flow

1. Client calls POST `/api/auth/logout`
2. Server destroys session cookie
3. Client redirects to login page

## Usage

### Client Components

```tsx
"use client";
import { useSession } from "@/lib/auth";
import { SignInButton, UserMenu, AuthGuard } from "@/components/auth";

// Hook for session state
function ProfileButton() {
  const { status, user, logout } = useSession();

  if (status === "loading") return <Spinner />;
  if (status === "unauthenticated") return <SignInButton />;

  return <button onClick={logout}>Logout {user.email}</button>;
}

// Pre-built components
function Header() {
  return (
    <header>
      <Logo />
      <UserMenu /> {/* Handles all states */}
    </header>
  );
}

// Auth guard for protected content
function ProtectedSection() {
  return (
    <AuthGuard>
      <SecretContent />
    </AuthGuard>
  );
}
```

### Server Components

```tsx
import { getServerSession, getServerUser, isAuthenticated } from "@/lib/auth/server";
import { redirect } from "next/navigation";

// Full session with tokens (for backend API calls)
export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Use session.accessToken for backend calls
  const data = await fetchFromBackend(session.accessToken);

  return <Dashboard data={data} user={session.user} />;
}

// Just user info
export default async function Header() {
  const user = await getServerUser();

  return <header>{user ? <Avatar user={user} /> : <LoginLink />}</header>;
}

// Simple auth check
export default async function ProtectedPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return <ProtectedContent />;
}
```

### API Routes

```typescript
import { getServerSession } from "@/lib/auth/server";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Make authenticated requests to backend
  const response = await fetch("https://api.example.com/data", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  return Response.json(await response.json());
}
```

## API Reference

### Route Handlers

| Endpoint                    | Method | Description                         |
| --------------------------- | ------ | ----------------------------------- |
| `/api/auth/google/start`    | GET    | Initiates Google OAuth flow         |
| `/api/auth/google/callback` | GET    | Handles OAuth callback              |
| `/api/auth/me`              | GET    | Returns current session (no tokens) |
| `/api/auth/logout`          | POST   | Destroys session                    |
| `/api/auth/refresh`         | POST   | Forces token refresh                |

### Response: GET /api/auth/me

```typescript
// Authenticated
{
  authenticated: true,
  user: {
    email: "user@example.com",
    name: "John Doe",
    avatarUrl: "https://..."
  },
  provider: "google"
}

// Unauthenticated
{
  authenticated: false
}
```

## Environment Variables

### Required

| Variable               | Description                           |
| ---------------------- | ------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret            |
| `AUTH_SESSION_SECRET`  | Session encryption key (min 32 chars) |
| `NEXT_PUBLIC_APP_URL`  | Application URL (for OAuth redirects) |

### Optional

| Variable                   | Default           | Description      |
| -------------------------- | ----------------- | ---------------- |
| `AUTH_SESSION_TTL_SECONDS` | `604800` (7 days) | Session lifetime |

### Setup

1. Create OAuth credentials at
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
3. Set environment variables in `.env.local`:

```bash
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
AUTH_SESSION_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Adding New Providers

The OAuth implementation is designed for easy provider extension:

### 1. Create Provider Module

```typescript
// lib/auth/providers/github.ts
export function buildGitHubAuthUrl(params: GitHubAuthParams): string {
  // Build authorization URL
}

export async function exchangeCodeForTokens(params: GitHubTokenParams): Promise<OAuthTokens> {
  // Exchange code for tokens
}

export async function fetchGitHubUserInfo(accessToken: string): Promise<OAuthUser> {
  // Fetch and normalize user info
}
```

### 2. Add Route Handlers

```typescript
// app/api/auth/github/start/route.ts
// app/api/auth/github/callback/route.ts
```

### 3. Update Types

```typescript
// lib/auth/types.ts
export type OAuthProvider = "google" | "github";
```

### 4. Add Refresh Logic

```typescript
// lib/auth/session.ts - refreshSession()
if (session.user.provider === "github") {
  tokens = await refreshGitHubToken(...);
}
```

## Security Considerations

### PKCE Implementation

- **Verifier**: 32 bytes (256 bits) of cryptographic randomness
- **Challenge**: SHA-256 hash of verifier, base64url encoded
- **Storage**: Temporary httpOnly cookie during OAuth flow

### State Parameter

- 16 bytes (128 bits) of cryptographic randomness
- Constant-time comparison to prevent timing attacks
- Consumed immediately after validation

### Session Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **IV**: Random 12 bytes per encryption
- **Authentication**: Built into GCM mode

### Token Handling

- Access tokens: Short-lived (1 hour), automatically refreshed
- Refresh tokens: Long-lived, stored encrypted, rotated when possible
- No tokens exposed to client JavaScript

## Troubleshooting

### Common Errors

| Error           | Cause                     | Solution                             |
| --------------- | ------------------------- | ------------------------------------ |
| `missing_state` | OAuth temp cookie missing | Cookie may have expired, retry login |
| `invalid_state` | CSRF check failed         | Don't refresh during OAuth flow      |
| `oauth_failed`  | Token exchange failed     | Check client ID/secret, redirect URI |

### Debug Checklist

1. Verify `NEXT_PUBLIC_APP_URL` matches Google's authorized redirect URI
2. Ensure `AUTH_SESSION_SECRET` is at least 32 characters
3. Check Google Console for correct OAuth scopes
4. Verify cookies are enabled in browser

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
- [Security](./SECURITY.md)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
