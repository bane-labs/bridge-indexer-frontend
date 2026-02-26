/**
 * Reference Form Example - Login Form
 *
 * Demonstrates the complete Atlas form validation pattern:
 * - Zod schema for validation
 * - useZodForm hook for form state
 * - FormField wrapper for accessibility
 * - Server validation error mapping
 *
 * This example is a complete, working form that can be copied and adapted.
 */

"use client";

import * as React from "react";
import { z } from "zod";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hooks/use-zod-form";
import { applyServerFieldErrors, getFormErrorMessage } from "@/lib/forms/server-errors";

import type { Meta, StoryObj } from "@storybook/react";

// ============================================================================
// STEP 1: Define Zod Schema (Schema-First Validation)
// ============================================================================

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// STEP 2: Create Form Component
// ============================================================================

export function LoginFormExample() {
  // Initialize form with useZodForm hook
  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  // State for non-field errors (e.g., network errors, general API errors)
  const [rootError, setRootError] = React.useState<string | null>(null);

  // ============================================================================
  // STEP 3: Submit Handler with Server Validation Mapping
  // ============================================================================

  const onSubmit = async (data: LoginFormData) => {
    setRootError(null);

    try {
      // Simulate API call (in real app, this would be an API call)
      await simulateLogin(data);

      // Success! (in real app, redirect or show toast)
      setRootError(null);
    } catch (error) {
      // Try to apply field-level errors from server
      if (!applyServerFieldErrors(form, error)) {
        // No field errors - show general error
        setRootError(getFormErrorMessage(error));
      }
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Sign In</h2>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Root Error (non-field errors) */}
        {rootError && (
          <div
            className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
            role="alert"
          >
            {rootError}
          </div>
        )}

        {/* Email Field */}
        <FormField
          name="email"
          label="Email Address"
          helpText="We'll never share your email with anyone."
          error={errors.email?.message}
          required
        >
          {(props) => (
            <Input
              {...props}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
          )}
        </FormField>

        {/* Password Field */}
        <FormField name="password" label="Password" error={errors.password?.message} required>
          {(props) => (
            <Input
              {...props}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
          )}
        </FormField>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Example Trigger Buttons (for demonstration) */}
      <div className="space-y-2 border-t pt-4">
        <p className="text-muted-foreground text-xs">Test server validation:</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              simulateValidationError().catch((error) => {
                if (!applyServerFieldErrors(form, error)) {
                  setRootError(getFormErrorMessage(error));
                }
              })
            }
          >
            Trigger Field Errors
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              simulateServerError().catch((error) => {
                setRootError(getFormErrorMessage(error));
              })
            }
          >
            Trigger Server Error
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Simulated API Functions (for demonstration)
// ============================================================================

async function simulateLogin(data: LoginFormData): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate validation error for specific email
  if (data.email === "taken@example.com") {
    throw {
      shape: {
        code: "VALIDATION_FAILED",
        message: "Validation failed",
        userMessage: "Please fix the errors below.",
        details: {
          fieldErrors: {
            email: ["This email is already registered"],
          },
        },
      },
    };
  }

  // Success (no console in production code)
}

async function simulateValidationError(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  throw {
    shape: {
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      userMessage: "Please fix the errors below.",
      details: {
        fieldErrors: {
          email: ["This email is not registered"],
          password: ["Invalid password"],
        },
      },
    },
  };
}

async function simulateServerError(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  throw {
    shape: {
      code: "INTERNAL_ERROR",
      message: "Database connection failed",
      userMessage: "Something went wrong. Please try again later.",
    },
  };
}

// ============================================================================
// Storybook Configuration
// ============================================================================

const meta: Meta<typeof LoginFormExample> = {
  title: "Examples/Forms/LoginForm",
  component: LoginFormExample,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoginFormExample>;

export const Default: Story = {};
