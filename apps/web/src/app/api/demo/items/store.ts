/**
 * Demo Items Data Model
 *
 * In-memory data store for demo purposes.
 * Uses module-level state for simplicity - resets on server restart.
 *
 * @module api/demo/items/store
 */

export interface DemoItem {
  id: string;
  title: string;
  description?: string;
  status: "open" | "closed";
  createdAt: string;
}

// In-memory store - resets on server restart
let items: DemoItem[] = [
  {
    id: "item-1",
    title: "Configure development environment",
    description: "Set up local dev with Docker and environment variables",
    status: "closed",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "item-2",
    title: "Implement authentication flow",
    description: "Google OAuth with PKCE and session cookies",
    status: "closed",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "item-3",
    title: "Build React Query patterns",
    description: "Create typed hooks for API calls with proper caching",
    status: "open",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "item-4",
    title: "Set up Sentry integration",
    description: "Error tracking with source maps and session replay",
    status: "open",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let nextId = 5;

export function getItems(): DemoItem[] {
  return [...items];
}

export function getItem(id: string): DemoItem | undefined {
  return items.find((item) => item.id === id);
}

export function createItem(data: { title: string; description?: string }): DemoItem {
  const newItem: DemoItem = {
    id: `item-${nextId++}`,
    title: data.title,
    description: data.description,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  return newItem;
}

export function updateItem(
  id: string,
  data: Partial<Pick<DemoItem, "title" | "description" | "status">>
): DemoItem | null {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const existingItem = items[index];
  if (!existingItem) return null;

  const updatedItem: DemoItem = { ...existingItem, ...data };
  items[index] = updatedItem;
  return updatedItem;
}

export function toggleItemStatus(id: string): DemoItem | null {
  const item = items.find((item) => item.id === id);
  if (!item) return null;

  item.status = item.status === "open" ? "closed" : "open";
  return item;
}

export function deleteItem(id: string): boolean {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  return true;
}

// Reset store for testing
export function resetStore(): void {
  items = [
    {
      id: "item-1",
      title: "Configure development environment",
      description: "Set up local dev with Docker and environment variables",
      status: "closed",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "item-2",
      title: "Implement authentication flow",
      description: "Google OAuth with PKCE and session cookies",
      status: "closed",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "item-3",
      title: "Build React Query patterns",
      description: "Create typed hooks for API calls with proper caching",
      status: "open",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "item-4",
      title: "Set up Sentry integration",
      description: "Error tracking with source maps and session replay",
      status: "open",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  nextId = 5;
}
