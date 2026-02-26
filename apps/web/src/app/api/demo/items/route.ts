/**
 * Demo Items API - GET and POST
 *
 * Demonstrates Atlas API patterns with mode switching:
 * - ?mode=success - Returns items list
 * - ?mode=empty - Returns empty array
 * - ?mode=error - Returns standard error shape
 * - ?mode=slow - Adds artificial delay then success
 *
 * @module api/demo/items
 */

import { NextResponse } from "next/server";

import { CORRELATION_ID_HEADER, generateCorrelationId } from "@/lib/api/correlation";

import { createItem, getItems } from "./store";

import type { DemoItem } from "./store";
import type { NextRequest } from "next/server";

// Response types matching Atlas API patterns
interface ListResponse {
  data: DemoItem[];
  meta: {
    total: number;
    mode: string;
  };
}

interface ApiErrorResponse {
  code: string;
  message: string;
  userMessage: string;
  correlationId: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
  };
}

// Validation schema for item creation
interface CreateItemBody {
  title?: unknown;
  description?: unknown;
}

function validateCreateItem(
  body: CreateItemBody
):
  | { valid: true; data: { title: string; description?: string } }
  | { valid: false; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};

  // Title validation
  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.title = ["Title is required"];
  } else if (body.title.length < 3) {
    errors.title = ["Title must be at least 3 characters"];
  } else if (body.title.length > 100) {
    errors.title = ["Title must be at most 100 characters"];
  }

  // Description validation (optional)
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.description = ["Description must be a string"];
  } else if (typeof body.description === "string" && body.description.length > 500) {
    errors.description = ["Description must be at most 500 characters"];
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title: (body.title as string).trim(),
      description: body.description ? (body.description as string).trim() : undefined,
    },
  };
}

/**
 * GET /api/demo/items
 *
 * List demo items with mode-based behavior.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ListResponse | ApiErrorResponse>> {
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? generateCorrelationId();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? "success";

  // Handle different modes
  switch (mode) {
    case "slow": {
      // Add 1.5s delay then return success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const items = getItems();
      return NextResponse.json<ListResponse>(
        { data: items, meta: { total: items.length, mode } },
        { headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    case "empty": {
      return NextResponse.json<ListResponse>(
        { data: [], meta: { total: 0, mode } },
        { headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    case "error": {
      return NextResponse.json<ApiErrorResponse>(
        {
          code: "DEMO_ERROR",
          message: "Simulated error for demo purposes",
          userMessage: "Something went wrong fetching the items. This is a demo error.",
          correlationId,
        },
        { status: 500, headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    case "success":
    default: {
      const items = getItems();
      return NextResponse.json<ListResponse>(
        { data: items, meta: { total: items.length, mode: "success" } },
        { headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }
  }
}

/**
 * POST /api/demo/items
 *
 * Create a new demo item with validation.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<DemoItem | ApiErrorResponse>> {
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? generateCorrelationId();

  try {
    const body = (await request.json()) as CreateItemBody;
    const validation = validateCreateItem(body);

    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        {
          code: "VALIDATION_FAILED",
          message: "Request validation failed",
          userMessage: "Please check your input and try again.",
          correlationId,
          details: {
            fieldErrors: validation.errors,
          },
        },
        { status: 422, headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    const item = createItem(validation.data);
    return NextResponse.json<DemoItem>(item, {
      status: 201,
      headers: { [CORRELATION_ID_HEADER]: correlationId },
    });
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      {
        code: "INVALID_JSON",
        message: "Failed to parse request body as JSON",
        userMessage: "Invalid request format. Please try again.",
        correlationId,
      },
      { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } }
    );
  }
}
