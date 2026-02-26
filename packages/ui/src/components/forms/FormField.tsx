/**
 * Form Field Wrapper with Automatic A11y
 *
 * Enforces accessibility conventions:
 * - Labels linked to controls via htmlFor/id
 * - Help text and error messages via aria-describedby
 * - aria-invalid set when errors present
 * - Stable IDs for consistent wiring
 *
 * This is a render-prop wrapper - NOT a replacement for actual input components.
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Props for the FormField component.
 */
export interface FormFieldProps {
  /**
   * Field name (used for ID generation and accessibility).
   */
  name: string;

  /**
   * Label text (required for accessibility).
   */
  label: React.ReactNode;

  /**
   * Optional help text shown below the control.
   */
  helpText?: React.ReactNode;

  /**
   * Error message (if present, field shows error state).
   */
  error?: string;

  /**
   * Whether field is required.
   */
  required?: boolean;

  /**
   * Additional CSS classes for the wrapper.
   */
  className?: string;

  /**
   * Render prop that receives accessibility props to spread onto the control.
   */
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean;
    "aria-required"?: boolean;
  }) => React.ReactNode;
}

/**
 * Form field wrapper with automatic accessibility wiring.
 *
 * Ensures:
 * - Label is linked to control
 * - Help text is linked via aria-describedby
 * - Error message is linked via aria-describedby
 * - aria-invalid is set when error exists
 * - IDs are stable and collision-free
 *
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   label="Email Address"
 *   helpText="We'll never share your email."
 *   error={errors.email?.message}
 *   required
 * >
 *   {(props) => (
 *     <Input
 *       {...props}
 *       type="email"
 *       placeholder="you@example.com"
 *       {...register("email")}
 *     />
 *   )}
 * </FormField>
 * ```
 */
export function FormField({
  name,
  label,
  helpText,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  // Generate stable IDs
  const fieldId = `field-${name}`;
  const helpTextId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // Build aria-describedby (space-separated IDs)
  const describedBy = [helpTextId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)} data-field-wrapper>
      {/* Label */}
      <label
        htmlFor={fieldId}
        className={cn(
          "block text-sm leading-none font-medium tracking-tight",
          error && "text-destructive"
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Control (rendered via children prop) */}
      {children({
        id: fieldId,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
        ...(required && { "aria-required": true }),
      })}

      {/* Help Text */}
      {helpText && !error && (
        <p id={helpTextId} className="text-muted-foreground text-sm">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          className="text-destructive text-sm font-medium"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
