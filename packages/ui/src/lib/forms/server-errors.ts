/**
 * Server Validation Error Mapping
 *
 * Maps backend validation errors to react-hook-form field errors.
 * Expects backend to return validation errors in standardized format.
 */

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * Standard validation error details shape from backend.
 * Extends ApiError.details with fieldErrors mapping.
 */
export interface ValidationErrorDetails {
  /**
   * Field-level validation errors.
   * Key is field name, value is array of error messages.
   */
  fieldErrors?: Record<string, string[]>;

  /**
   * Legacy "fields" format (for backward compatibility).
   * Same as fieldErrors but under different key.
   */
  fields?: Record<string, string[]>;
}

/**
 * ApiError shape (duck-typed to avoid circular dependencies).
 */
interface ApiErrorLike {
  shape: {
    code: string;
    message: string;
    userMessage?: string;
    correlationId?: string;
    details?: ValidationErrorDetails;
  };
  status?: number;
}

/**
 * Type guard to check if error is an ApiError-like object.
 */
function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "shape" in error &&
    typeof (error as ApiErrorLike).shape === "object" &&
    "code" in (error as ApiErrorLike).shape
  );
}

/**
 * Apply server-side validation errors to react-hook-form.
 *
 * Expected backend error format:
 * ```json
 * {
 *   "code": "VALIDATION_FAILED",
 *   "message": "Validation failed",
 *   "userMessage": "Please fix the errors below.",
 *   "details": {
 *     "fieldErrors": {
 *       "email": ["Invalid email format"],
 *       "password": ["Too short", "Must contain a number"]
 *     }
 *   }
 * }
 * ```
 *
 * @param form - React-hook-form instance
 * @param error - Error from API call (should be ApiError)
 * @returns true if validation errors were applied, false otherwise
 *
 * @example
 * ```tsx
 * async function onSubmit(data: FormData) {
 *   try {
 *     await api.users.create(data);
 *   } catch (error) {
 *     // Try to apply field errors
 *     if (!applyServerFieldErrors(form, error)) {
 *       // Fallback: show general error message
 *       toast.error(getFormErrorMessage(error));
 *     }
 *   }
 * }
 * ```
 */
export function applyServerFieldErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown
): boolean {
  // Type guard: must be ApiError-like
  if (!isApiErrorLike(error)) {
    return false;
  }

  // Must be validation error
  if (error.shape.code !== "VALIDATION_FAILED" && error.shape.code !== "VALIDATION_ERROR") {
    return false;
  }

  // Extract field errors (support both "fieldErrors" and legacy "fields")
  const fieldErrors = error.shape.details?.fieldErrors ?? error.shape.details?.fields;

  if (!fieldErrors || typeof fieldErrors !== "object") {
    return false;
  }

  // Apply each field error to the form
  let appliedAny = false;
  for (const [fieldName, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      form.setError(fieldName as Path<TFieldValues>, {
        type: "server",
        message: messages[0], // Use first message
      });
      appliedAny = true;
    }
  }

  return appliedAny;
}

/**
 * Extract user-facing error message from any error.
 * Prioritizes userMessage from ApiError, falls back to generic message.
 *
 * @param error - Error from API call
 * @returns User-friendly error message
 *
 * @example
 * ```tsx
 * catch (error) {
 *   if (!applyServerFieldErrors(form, error)) {
 *     toast.error(getFormErrorMessage(error));
 *   }
 * }
 * ```
 */
export function getFormErrorMessage(error: unknown): string {
  if (isApiErrorLike(error) && error.shape.userMessage) {
    return error.shape.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An error occurred. Please try again.";
}
