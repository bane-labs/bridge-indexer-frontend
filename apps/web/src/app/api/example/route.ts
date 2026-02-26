/**
 * Example Route Handler
 *
 * Route handlers are API boundaries and CAN use fetch() directly.
 * This should NOT trigger the no-fetch-spaghetti ESLint rule.
 */

import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  // This is allowed - route handlers are API boundaries
  const externalData = await fetch("https://api.example.com/data");
  const json = await externalData.json();

  return NextResponse.json(json);
}
