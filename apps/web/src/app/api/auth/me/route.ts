/**
 * Session Information Handler
 *
 * Returns current session status and user information.
 * Does NOT return tokens - only safe user data.
 *
 * @route GET /api/auth/me
 */

import { NextResponse } from "next/server";

import { getSessionResponse } from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionResponse();

  return NextResponse.json(session);
}
