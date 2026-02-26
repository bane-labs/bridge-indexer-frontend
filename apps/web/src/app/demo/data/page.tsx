"use client";

/**
 * Data Fetching Demo Page
 *
 * Demonstrates Atlas data fetching patterns:
 * - React Query with typed hooks
 * - App states: loading, empty, error, success
 * - Mode switching for testing different states
 * - Mutations with cache invalidation
 *
 * @module app/demo/data/page
 */

import { Circle, CircleCheck, Plus, RefreshCw, ToggleLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorFallback,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SkeletonList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@atlas/ui";

import { useDemoItems, useToggleDemoItemStatus } from "@/features/demo";
import { ApiError } from "@/lib/api";

import type { DemoItemsListResponse, DemoMode } from "@/features/demo";
import type { UseMutationResult } from "@tanstack/react-query";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Data content component to avoid nested ternaries
 */
function DataContent({
  isLoading,
  isError,
  error,
  data,
  correlationId,
  refetch,
  toggleStatus,
}: {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: DemoItemsListResponse | undefined;
  correlationId: string | undefined;
  refetch: () => void;
  toggleStatus: UseMutationResult<unknown, Error, string, unknown>;
}) {
  // Loading State
  if (isLoading) {
    return <SkeletonList count={4} className="space-y-3" />;
  }

  // Error State
  if (isError) {
    return (
      <ErrorFallback
        title="Failed to load items"
        description={
          error instanceof ApiError ? error.shape.userMessage : "An unexpected error occurred"
        }
        correlationId={correlationId}
        onRetry={() => refetch()}
      />
    );
  }

  // Empty State
  if (!data?.data.length) {
    return (
      <EmptyState
        title="No items yet"
        description="Get started by creating your first item."
        actions={
          <Button asChild>
            <a href="/demo/form">
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </a>
          </Button>
        }
      />
    );
  }

  // Success State
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-24 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              {item.status === "closed" ? (
                <CircleCheck className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="text-muted-foreground h-5 w-5" />
              )}
            </TableCell>
            <TableCell>
              <div>
                <p
                  className={
                    item.status === "closed" ? "text-muted-foreground line-through" : "font-medium"
                  }
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-muted-foreground max-w-md truncate text-xs">
                    {item.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStatus.mutate(item.id)}
                disabled={toggleStatus.isPending}
              >
                <ToggleLeft className="mr-1 h-4 w-4" />
                Toggle
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function DataDemoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as DemoMode) || "success";

  const { data, isLoading, isError, error, refetch, isFetching } = useDemoItems(mode);
  const toggleStatus = useToggleDemoItemStatus();

  const handleModeChange = (newMode: DemoMode) => {
    router.push(`/demo/data?mode=${newMode}`);
  };

  // Extract correlation ID from error if available
  const correlationId = error instanceof ApiError ? error.shape.correlationId : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Fetching Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates React Query patterns with loading, empty, error, and success states.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demo Controls</CardTitle>
          <CardDescription>
            Switch modes to see different states. Uses query params for bookmarkable URLs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mode:</span>
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success (4 items)</SelectItem>
                  <SelectItem value="empty">Empty (0 items)</SelectItem>
                  <SelectItem value="error">Error (500)</SelectItem>
                  <SelectItem value="slow">Slow (1.5s delay)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refetch
            </Button>
            <Badge variant="secondary">
              {data?.meta.total ?? 0} items • mode: {data?.meta.mode ?? mode}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Display with App States */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demo Items</CardTitle>
          <CardDescription>
            Data fetched from /api/demo/items with mode-based behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataContent
            isLoading={isLoading}
            isError={isError}
            error={error}
            data={data}
            correlationId={correlationId}
            refetch={refetch}
            toggleStatus={toggleStatus}
          />
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Patterns Demonstrated</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <p className="font-medium">Query Key Factory</p>
            <p className="text-muted-foreground">
              demoItemsKeys.list(&#123; mode &#125;) for consistent cache keys
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Optimistic Updates</p>
            <p className="text-muted-foreground">
              Toggle status updates UI immediately, rolls back on error
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Cache Invalidation</p>
            <p className="text-muted-foreground">
              Mutations invalidate list queries to refetch fresh data
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">App States Kit</p>
            <p className="text-muted-foreground">
              SkeletonList, EmptyState, ErrorFallback from @atlas/ui
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
