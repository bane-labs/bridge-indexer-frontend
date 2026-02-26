/**
 * Session Refresh Handler
 *
 * Forces a token refresh on the server side.
 * Updates the session cookie with new tokens.
 *
 * @route POST /api/auth/refresh
 */

import { NextResponse } from "next/server";

import { readSession, refreshSession } from "@/lib/auth/session";

export async function POST() {
  try {
    const session = await readSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!session.refreshToken) {
      return NextResponse.json({ error: "No refresh token available" }, { status: 400 });
    }

    await refreshSession(session);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
