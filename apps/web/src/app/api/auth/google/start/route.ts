/**
 * Google OAuth Start Handler
 *
 * Initiates the Google OAuth flow by:
 * 1. Generating PKCE verifier and challenge
 * 2. Generating CSRF state token
 * 3. Storing verifier + state in temporary cookie
 * 4. Redirecting to Google's authorization page
 *
 * @route GET /api/auth/google/start
 */

import { NextResponse } from "next/server";

import { getServerConfig } from "@/config/server";
import { generateChallenge, generateVerifier } from "@/lib/auth/pkce";
import { buildGoogleAuthUrl } from "@/lib/auth/providers/google";
import { setOAuthTempCookie } from "@/lib/auth/session";
import { generateState } from "@/lib/auth/state";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const config = getServerConfig();
  const appUrl = config.app.url || "http://localhost:3000";

  // Validate OAuth is configured
  if (!config.auth.googleClientId) {
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "oauth_not_configured");
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Get optional returnTo parameter (where to redirect after login)
    const returnTo = request.nextUrl.searchParams.get("returnTo");

    // Validate returnTo is same-origin to prevent open redirect
    let validatedReturnTo: string | undefined;
    if (returnTo) {
      try {
        const returnToUrl = new URL(returnTo, appUrl);
        const appUrlParsed = new URL(appUrl);

        if (returnToUrl.origin === appUrlParsed.origin) {
          validatedReturnTo = returnToUrl.pathname + returnToUrl.search;
        }
      } catch {
        // Invalid URL - ignore returnTo
      }
    }

    // Generate PKCE verifier and challenge
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);

    // Generate CSRF state token
    const state = generateState();

    // Store in temporary cookie for callback validation
    await setOAuthTempCookie({
      verifier,
      state,
      returnTo: validatedReturnTo,
    });

    // Build redirect URI
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    // Build authorization URL
    const authUrl = buildGoogleAuthUrl({
      clientId: config.auth.googleClientId,
      redirectUri,
      codeChallenge: challenge,
      state,
    });

    // Redirect to Google
    return NextResponse.redirect(authUrl);
  } catch {
    // Redirect to login page with error
    const errorUrl = new URL("/login", appUrl);
    errorUrl.searchParams.set("error", "oauth_start_failed");

    return NextResponse.redirect(errorUrl);
  }
}
