/**
 * Google OAuth Callback Handler
 *
 * Handles the OAuth callback from Google:
 * 1. Validates CSRF state parameter
 * 2. Exchanges authorization code for tokens (with PKCE verifier)
 * 3. Fetches user information
 * 4. Creates session cookie
 * 5. Redirects to app
 *
 * @route GET /api/auth/google/callback
 */

import { NextResponse } from "next/server";

import { getServerConfig } from "@/config/server";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/lib/auth/providers/google";
import { consumeOAuthTempCookie, createSessionCookie } from "@/lib/auth/session";
import { verifyState } from "@/lib/auth/state";

import type { SessionData } from "@/lib/auth/types";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const config = getServerConfig();
  const appUrl = config.app.url || "http://localhost:3000";

  // Validate OAuth is configured
  if (!config.auth.googleClientId || !config.auth.googleClientSecret) {
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "oauth_not_configured");
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Get code and state from query parameters
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const error = request.nextUrl.searchParams.get("error");

    // Handle OAuth errors from Google
    if (error) {
      const errorUrl = new URL("/login", appUrl);
      errorUrl.searchParams.set("error", error);
      return NextResponse.redirect(errorUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      const errorUrl = new URL("/login", appUrl);
      errorUrl.searchParams.set("error", "missing_params");
      return NextResponse.redirect(errorUrl);
    }

    // Get and validate temporary OAuth state
    const tempState = await consumeOAuthTempCookie();

    if (!tempState) {
      const errorUrl = new URL("/login", appUrl);
      errorUrl.searchParams.set("error", "missing_state");
      return NextResponse.redirect(errorUrl);
    }

    // Verify CSRF state token
    if (!verifyState(state, tempState.state)) {
      const errorUrl = new URL("/login", appUrl);
      errorUrl.searchParams.set("error", "invalid_state");
      return NextResponse.redirect(errorUrl);
    }

    // Build redirect URI (must match what was sent to Google)
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: tempState.verifier,
      redirectUri,
      clientId: config.auth.googleClientId,
      clientSecret: config.auth.googleClientSecret,
    });

    // Fetch user information
    const user = await fetchGoogleUserInfo(tokens.accessToken);

    // Calculate session expiry
    const now = Math.floor(Date.now() / 1000);
    const sessionTTL = config.auth.sessionTtlSeconds;
    const expiresAt = now + sessionTTL;

    // Create session data
    const sessionData: SessionData = {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.expiresAt,
      createdAt: now,
      expiresAt,
    };

    // Create session cookie
    await createSessionCookie(sessionData);

    // Redirect to returnTo or home
    const redirectTo = tempState.returnTo || "/";
    return NextResponse.redirect(new URL(redirectTo, appUrl));
  } catch {
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "oauth_failed");
    return NextResponse.redirect(errorUrl);
  }
}
