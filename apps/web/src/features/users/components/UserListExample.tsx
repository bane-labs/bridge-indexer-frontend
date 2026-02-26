/**
 * Example User List Component
 *
 * Demonstrates the complete data fetching pattern:
 * - Client Component with React Query
 * - Type-safe API contracts
 * - User-friendly error messages
 * - Loading states
 * - Cache invalidation after mutations
 */

"use client";

import { useState } from "react";

import { useCreateUser, useDeleteUser, useUserList } from "@/features/users";
import { getUserFacingMessage } from "@/lib/api";

import type { paths } from "@/lib/api/contracts";

type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];

/**
 * Example component showing user list with create/delete functionality.
 *
 * This demonstrates:
 * - Using custom query hooks from feature modules
 * - Using custom mutation hooks with cache invalidation
 * - Error handling with user-friendly messages
 * - Loading states
 * - Optimistic updates via cache invalidation
 */
export function UserListExample() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Query hook - automatically cached and deduped
  const { data, error, isLoading, refetch } = useUserList({
    page,
    pageSize: 10,
    search: search || undefined,
  });

  // Mutation hooks - automatically invalidate cache
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const handleCreateUser = () => {
    const newUser: CreateUserRequest = {
      email: `user-${Date.now()}@example.com`,
      name: `Test User ${Date.now()}`,
      role: "user",
    };

    createUser.mutate(newUser, {
      onSuccess: (user) => {
        // eslint-disable-next-line no-console
        console.log("Created user:", user);
        // Cache is automatically invalidated and refetched
      },
      onError: (err) => {
        // In production, use toast.error() instead
        // eslint-disable-next-line no-alert
        alert(getUserFacingMessage(err));
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    // In production, use a proper confirmation modal
    // eslint-disable-next-line no-alert
    if (!confirm("Are you sure you want to delete this user?")) return;

    deleteUser.mutate(userId, {
      onSuccess: () => {
        // eslint-disable-next-line no-console
        console.log("Deleted user:", userId);
        // Cache is automatically invalidated and refetched
      },
      onError: (err) => {
        // In production, use toast.error() instead
        // eslint-disable-next-line no-alert
        alert(getUserFacingMessage(err));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
        <h3 className="text-destructive font-semibold">Error Loading Users</h3>
        <p className="text-destructive/90 text-sm">{getUserFacingMessage(error)}</p>
        {error.shape.correlationId && (
          <p className="text-muted-foreground mt-2 text-xs">
            Correlation ID: {error.shape.correlationId}
          </p>
        )}
        <button
          onClick={() => void refetch()}
          className="bg-destructive hover:bg-destructive/90 mt-4 rounded px-4 py-2 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground text-sm">Total: {data.pagination.total} users</p>
        </div>
        <button
          onClick={handleCreateUser}
          disabled={createUser.isPending}
          className="bg-primary hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {createUser.isPending ? "Creating..." : "Create User"}
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full rounded-lg border px-4 py-2 text-sm"
        />
      </div>

      {/* User List */}
      <div className="space-y-2">
        {data.data.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground text-sm">{user.email}</div>
              <div className="text-muted-foreground mt-1 text-xs">
                Role: {user.role} • ID: {user.id}
              </div>
            </div>
            <button
              onClick={() => handleDeleteUser(user.id)}
              disabled={deleteUser.isPending}
              className="bg-destructive hover:bg-destructive/90 rounded px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {deleteUser.isPending ? "..." : "Delete"}
            </button>
          </div>
        ))}

        {data.data.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">No users found.</div>
        )}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
