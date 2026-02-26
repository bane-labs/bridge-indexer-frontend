/**
 * Logout Handler
 *
 * Destroys the session cookie and logs the user out.
 *
 * @route POST /api/auth/logout
 */

import { NextResponse } from "next/server";

import { destroySessionCookie } from "@/lib/auth/session";

export async function POST() {
  await destroySessionCookie();

  return NextResponse.json({ success: true }, { status: 200 });
}
