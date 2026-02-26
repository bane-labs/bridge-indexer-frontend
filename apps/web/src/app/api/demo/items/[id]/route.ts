/**
 * Demo Items API - PATCH by ID
 *
 * Toggle item status or update item.
 *
 * @module api/demo/items/[id]
 */

import { NextResponse } from "next/server";

import { CORRELATION_ID_HEADER, generateCorrelationId } from "@/lib/api/correlation";

import { getItem, toggleItemStatus, updateItem } from "../store";

import type { DemoItem } from "../store";
import type { NextRequest } from "next/server";

interface ApiErrorResponse {
  code: string;
  message: string;
  userMessage: string;
  correlationId: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/demo/items/:id
 *
 * Update a demo item. Supports:
 * - { action: "toggle" } - Toggle status between open/closed
 * - { title?, description?, status? } - Update fields
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DemoItem | ApiErrorResponse>> {
  const correlationId = request.headers.get(CORRELATION_ID_HEADER) ?? generateCorrelationId();
  const { id } = await context.params;

  // Check if item exists
  const existingItem = getItem(id);
  if (!existingItem) {
    return NextResponse.json<ApiErrorResponse>(
      {
        code: "NOT_FOUND",
        message: `Item with id "${id}" not found`,
        userMessage: "The requested item was not found.",
        correlationId,
      },
      { status: 404, headers: { [CORRELATION_ID_HEADER]: correlationId } }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: string;
      title?: string;
      description?: string;
      status?: string;
    };

    // Handle toggle action
    if (body.action === "toggle") {
      const updated = toggleItemStatus(id);
      if (!updated) {
        return NextResponse.json<ApiErrorResponse>(
          {
            code: "UPDATE_FAILED",
            message: "Failed to toggle item status",
            userMessage: "Could not update the item. Please try again.",
            correlationId,
          },
          { status: 500, headers: { [CORRELATION_ID_HEADER]: correlationId } }
        );
      }
      return NextResponse.json<DemoItem>(updated, {
        headers: { [CORRELATION_ID_HEADER]: correlationId },
      });
    }

    // Handle field updates
    const updates: Partial<Pick<DemoItem, "title" | "description" | "status">> = {};

    if (typeof body.title === "string") {
      updates.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }
    if (body.status === "open" || body.status === "closed") {
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ApiErrorResponse>(
        {
          code: "NO_UPDATES",
          message: "No valid update fields provided",
          userMessage: "Please provide at least one field to update.",
          correlationId,
        },
        { status: 400, headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    const updated = updateItem(id, updates);
    if (!updated) {
      return NextResponse.json<ApiErrorResponse>(
        {
          code: "UPDATE_FAILED",
          message: "Failed to update item",
          userMessage: "Could not update the item. Please try again.",
          correlationId,
        },
        { status: 500, headers: { [CORRELATION_ID_HEADER]: correlationId } }
      );
    }

    return NextResponse.json<DemoItem>(updated, {
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
