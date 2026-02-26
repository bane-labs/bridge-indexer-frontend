"use client";

/**
 * Form Demo Page
 *
 * Demonstrates Atlas form patterns:
 * - React Hook Form with Zod validation
 * - Field-level error display with accessibility
 * - Server validation error mapping
 * - Success notifications
 *
 * @module app/demo/form/page
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  applyServerFieldErrors,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFormErrorMessage,
  Input,
  Textarea,
  useZodForm,
} from "@atlas/ui";

import { useCreateDemoItem } from "@/features/demo";
import { ApiError } from "@/lib/api";
import { notify } from "@/lib/notifications";

// Zod schema - same validation rules as server
const createItemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
});

type CreateItemFormData = z.infer<typeof createItemSchema>;

export default function FormDemoPage() {
  const router = useRouter();
  const createItem = useCreateDemoItem();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useZodForm(createItemSchema, {
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: CreateItemFormData) => {
    setServerError(null);

    try {
      await createItem.mutateAsync(data);
      notify.success("Item created successfully!");
      router.push("/demo/data?mode=success");
    } catch (error) {
      // Try to apply server field errors
      if (!applyServerFieldErrors(form, error)) {
        // Fallback to general error message
        const message = getFormErrorMessage(error);
        setServerError(message);

        // Also notify
        notify.error(message, {
          description:
            error instanceof ApiError ? `Reference: ${error.shape.correlationId}` : undefined,
        });
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Form Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates React Hook Form with Zod validation and server error mapping.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Demo Item</CardTitle>
          <CardDescription>
            Fill out the form to create a new item. Try submitting with invalid data to see
            validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Server Error Alert */}
              {serverError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a title (3-100 characters)"
                        autoComplete="off"
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>A short, descriptive title for the item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter an optional description (max 500 characters)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional details about the item.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={createItem.isPending}>
                  {createItem.isPending ? "Creating..." : "Create Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/demo/data")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Test Server Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Test Server Validation</CardTitle>
          <CardDescription>
            The server validates the same rules as the client. Try bypassing client validation:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="font-medium">How to test server validation:</p>
            <ol className="text-muted-foreground mt-2 list-inside list-decimal space-y-1">
              <li>Open browser DevTools (Network tab)</li>
              <li>Submit a valid form to see the POST request</li>
              <li>Right-click the request → &quot;Edit and Resend&quot;</li>
              <li>Modify the body to have an empty title</li>
              <li>The response will include fieldErrors</li>
            </ol>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
            <p className="text-muted-foreground mb-2">Server response example:</p>
            <pre className="whitespace-pre-wrap">
              {`{
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "userMessage": "Please check your input...",
  "correlationId": "abc-123",
  "details": {
    "fieldErrors": {
      "title": ["Title is required"]
    }
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Field Pattern */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative Field Pattern</CardTitle>
          <CardDescription>
            Atlas also supports a simpler Field component pattern for non-RHF forms:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="alt-title">Title</FieldLabel>
              <Input id="alt-title" placeholder="Demo field" />
              <FieldDescription>Uses the Field component from @atlas/ui</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="alt-error">With Error</FieldLabel>
              <Input id="alt-error" aria-invalid="true" className="border-destructive" />
              <FieldError>This field has an error state</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
