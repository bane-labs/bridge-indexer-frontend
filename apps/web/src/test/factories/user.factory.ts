/**
 * User Factory
 *
 * Factory for generating test user data using Fishery.
 * Provides deterministic, customizable test data.
 */

import { Factory } from "fishery";

/**
 * User type based on API contract
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Simple email generator
const generateEmail = (firstName: string, lastName: string, sequence: number): string => {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${sequence}@example.com`;
};

// Predefined names for deterministic testing
const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Edward", "Fiona", "George", "Hannah"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];

/**
 * User factory for generating test user data.
 *
 * @example
 * ```ts
 * // Generate a single user with defaults
 * const user = userFactory.build();
 *
 * // Generate with overrides
 * const admin = userFactory.build({ email: 'admin@example.com' });
 *
 * // Generate multiple users
 * const users = userFactory.buildList(5);
 * ```
 */
export const userFactory = Factory.define<User>(({ sequence }) => {
  const firstName = firstNames[sequence % firstNames.length]!;
  const lastName = lastNames[sequence % lastNames.length]!;
  const baseDate = new Date("2024-01-01T00:00:00Z");

  return {
    id: `user-${sequence}`,
    email: generateEmail(firstName, lastName, sequence),
    name: `${firstName} ${lastName}`,
    createdAt: new Date(baseDate.getTime() + sequence * 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(baseDate.getTime() + sequence * 1000 * 60 * 60).toISOString(),
  };
});

/**
 * Preset: Admin user
 */
export const adminUserFactory = userFactory.params({
  email: "admin@example.com",
  name: "Admin User",
});

/**
 * Preset: Regular user
 */
export const regularUserFactory = userFactory.params({
  email: "user@example.com",
  name: "Regular User",
});
