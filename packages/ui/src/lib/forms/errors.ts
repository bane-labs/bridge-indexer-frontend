/**
 * Form Error Utilities
 *
 * Helper functions for working with react-hook-form errors.
 */

import type { FieldErrors } from "react-hook-form";

/**
 * Extract error message for a specific field from react-hook-form errors.
 *
 * @param errors - React-hook-form errors object
 * @param name - Field name (supports nested paths like "user.email")
 * @returns Error message string, or undefined if no error
 *
 * @example
 * ```tsx
 * const errors = form.formState.errors;
 * const emailError = getFieldErrorMessage(errors, "email");
 * // => "Invalid email format"
 * ```
 */
export function getFieldErrorMessage(errors: FieldErrors, name: string): string | undefined {
  // Split nested path (e.g., "user.email" => ["user", "email"])
  const keys = name.split(".");

  let current: unknown = errors;

  for (const key of keys) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  // Return message if it exists and is a string
  if (current && typeof current === "object" && "message" in current) {
    const { message } = current as { message?: unknown };
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}
