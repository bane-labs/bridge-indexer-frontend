"use client";

/**
 * Form Validation Hook - useZodForm
 *
 * Platform-standard form hook providing:
 * - Type-safe validation with Zod schemas
 * - Consistent validation timing (onBlur for initial, onChange for re-validation)
 * - Automatic error focus management
 * - Accessibility defaults
 *
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email("Invalid email"),
 *   password: z.string().min(8, "Too short"),
 * });
 *
 * const form = useZodForm(schema, {
 *   defaultValues: { email: "", password: "" }
 * });
 * ```
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";

import type { z } from "zod";

/**
 * Options for useZodForm hook.
 * Extends react-hook-form's UseFormProps with platform defaults.
 */
export type UseZodFormOptions<TSchema extends z.ZodTypeAny> = Omit<
  UseFormProps<z.infer<TSchema>>,
  "resolver"
>;

/**
 * Platform-standard form hook with Zod validation.
 *
 * Platform defaults:
 * - mode: "onBlur" - Validates when field loses focus (better UX than onChange)
 * - reValidateMode: "onChange" - Re-validates on every change after first validation
 * - shouldFocusError: true - Auto-focuses first error field on submit
 * - criteriaMode: "firstError" - Shows only first error per field (cleaner UI)
 *
 * @param schema - Zod schema for form validation
 * @param options - Additional react-hook-form options (mode, defaultValues, etc.)
 * @returns Typed form instance with all react-hook-form methods
 */
export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options?: UseZodFormOptions<TSchema>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    // Platform defaults
    mode: "onBlur", // Validate when field loses focus
    reValidateMode: "onChange", // Re-validate on every change after first validation
    shouldFocusError: true, // Auto-focus first error on submit
    criteriaMode: "firstError", // Show only first error per field
    // User overrides
    ...options,
    // Always use Zod resolver (cannot be overridden)
    resolver: zodResolver(schema),
  });
}
