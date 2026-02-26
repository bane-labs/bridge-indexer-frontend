# Form Validation Patterns

**Schema-first, accessible, server-aligned form validation for Atlas.**

This document defines the standard patterns for building forms with **React Hook Form + Zod**
validation, ensuring consistency, accessibility, and seamless backend integration.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Principles](#core-principles)
3. [Standard Pattern](#standard-pattern)
4. [Field Conventions](#field-conventions)
5. [Server Validation Alignment](#server-validation-alignment)
6. [API Reference](#api-reference)
7. [Examples](#examples)

---

## Quick Start

```tsx
import { z } from "zod";
import { useZodForm, FormFieldWrapper, Input, Button } from "@atlas/ui";
import { applyServerFieldErrors, getFormErrorMessage } from "@atlas/ui";

// 1. Define schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Too short"),
});

// 2. Create form
function MyForm() {
  const form = useZodForm(schema);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const [rootError, setRootError] = React.useState<string | null>(null);

  // 3. Submit with server validation
  const onSubmit = async (data) => {
    try {
      await api.users.login(data);
    } catch (error) {
      if (!applyServerFieldErrors(form, error)) {
        setRootError(getFormErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {rootError && <div role="alert">{rootError}</div>}

      <FormFieldWrapper name="email" label="Email" error={errors.email?.message} required>
        {(props) => <Input {...props} {...register("email")} />}
      </FormFieldWrapper>

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## Core Principles

### 1. Schema-First Validation

- Define validation rules **once** in Zod schemas
- Type safety automatically inferred from schema
- Single source of truth for validation logic

### 2. Accessibility by Default

- Labels **always** linked to controls (`htmlFor` + `id`)
- Help text and errors linked via `aria-describedby`
- `aria-invalid` set when errors present
- `aria-required` set for required fields
- Error messages announced via `role="alert"` and `aria-live="polite"`

### 3. Server Validation Alignment

- Backend validation errors automatically map to form fields
- Standardized error shape: `{ code, message, userMessage, details.fieldErrors }`
- Graceful fallback to general error messages

---

## Standard Pattern

### Step 1: Define Zod Schema

```tsx
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be 18 or older").optional(),
});

type UserFormData = z.infer<typeof userSchema>;
```

### Step 2: Initialize Form with `useZodForm`

```tsx
import { useZodForm } from "@atlas/ui";

const form = useZodForm(userSchema, {
  defaultValues: {
    name: "",
    email: "",
    age: undefined,
  },
});

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = form;
```

**Platform defaults:**

- `mode: "onBlur"` - Validate when field loses focus (better UX)
- `reValidateMode: "onChange"` - Re-validate on change after first validation
- `shouldFocusError: true` - Auto-focus first error on submit
- `criteriaMode: "firstError"` - Show only first error per field

### Step 3: Build Form with `FormFieldWrapper`

```tsx
<FormFieldWrapper
  name="email"
  label="Email Address"
  helpText="We'll never share your email."
  error={errors.email?.message}
  required
>
  {(props) => (
    <Input {...props} type="email" placeholder="you@example.com" {...register("email")} />
  )}
</FormFieldWrapper>
```

### Step 4: Handle Submission with Server Validation

```tsx
import { applyServerFieldErrors, getFormErrorMessage } from "@atlas/ui";

const [rootError, setRootError] = React.useState<string | null>(null);

const onSubmit = async (data: UserFormData) => {
  setRootError(null);

  try {
    await api.users.create(data);
    // Success!
  } catch (error) {
    // Try to apply field-level errors
    if (!applyServerFieldErrors(form, error)) {
      // No field errors - show general error
      setRootError(getFormErrorMessage(error));
    }
  }
};
```

---

## Field Conventions

### Labels (Required)

Every field **must** have a label:

```tsx
<FormFieldWrapper
  name="username"
  label="Username"  // ← Required
  // ...
>
```

### Help Text (Optional)

Provide context or instructions:

```tsx
<FormFieldWrapper
  name="password"
  label="Password"
  helpText="Must be at least 8 characters"  // ← Optional
  // ...
>
```

Help text is hidden when an error is shown (error takes precedence).

### Error Display

Errors are **automatically** wired with:

- `aria-invalid="true"` on the control
- `aria-describedby` pointing to error message
- `role="alert"` + `aria-live="polite"` for screen reader announcement

```tsx
<FormFieldWrapper
  name="email"
  label="Email"
  error={errors.email?.message}  // ← From react-hook-form
  // ...
>
```

### Required Fields

Mark required fields:

```tsx
<FormFieldWrapper
  name="email"
  label="Email"
  required  // ← Adds asterisk, sets aria-required
  // ...
>
```

### Accessibility Attributes

`FormFieldWrapper` automatically provides:

```tsx
{
  (props) => (
    <Input
      {...props} // ← Spreads: id, aria-describedby, aria-invalid, aria-required
      {...register("email")}
    />
  );
}
```

**Generated attributes:**

- `id="field-email"`
- `aria-describedby="field-email-help field-email-error"` (if help/error present)
- `aria-invalid="true"` (if error present)
- `aria-required="true"` (if required)

---

## Server Validation Alignment

### Expected Error Shape

Backend should return validation errors in this format:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Validation failed",
  "userMessage": "Please fix the errors below.",
  "correlationId": "req-abc-123",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "password": ["Too short", "Must contain a number"]
    }
  }
}
```

**Field errors contract:**

- `details.fieldErrors` is a `Record<string, string[]>`
- Each field can have multiple error messages
- Only the **first** message is shown per field

**Legacy format:**

- `details.fields` is also supported for backward compatibility

### Mapping Server Errors to Fields

Use `applyServerFieldErrors`:

```tsx
try {
  await api.submitForm(data);
} catch (error) {
  if (!applyServerFieldErrors(form, error)) {
    // No field errors found - show general error
    setRootError(getFormErrorMessage(error));
  }
}
```

**Logic:**

1. Check if error is `ApiError`-like
2. Check if `code === "VALIDATION_FAILED"` or `"VALIDATION_ERROR"`
3. Extract `details.fieldErrors` (or `details.fields`)
4. Apply each error to corresponding field via `form.setError()`
5. Return `true` if any errors applied, `false` otherwise

### Displaying Non-Field Errors

For general/root errors (network, auth, server errors):

```tsx
const [rootError, setRootError] = React.useState<string | null>(null);

// In catch block:
if (!applyServerFieldErrors(form, error)) {
  setRootError(getFormErrorMessage(error));
}

// In JSX:
{
  rootError && (
    <div className="border-destructive/50 bg-destructive/10 rounded-md border p-3" role="alert">
      {rootError}
    </div>
  );
}
```

---

## API Reference

### `useZodForm<TSchema>(schema, options?)`

Platform-standard form hook with Zod validation.

**Parameters:**

- `schema: z.ZodTypeAny` - Zod schema for validation
- `options?: UseFormProps` - react-hook-form options (mode, defaultValues, etc.)

**Returns:** `UseFormReturn<z.infer<TSchema>>`

**Example:**

```tsx
const form = useZodForm(schema, {
  defaultValues: { name: "", email: "" },
});
```

---

### `FormFieldWrapper`

Render-prop component for accessible form fields.

**Props:**

- `name: string` - Field name (used for ID generation)
- `label: React.ReactNode` - Label text (required)
- `helpText?: React.ReactNode` - Optional help text
- `error?: string` - Error message (if present)
- `required?: boolean` - Mark field as required
- `className?: string` - Additional CSS classes
- `children: (props) => ReactNode` - Render prop receiving accessibility props

**Render prop receives:**

```tsx
{
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
  "aria-required"?: boolean;
}
```

**Example:**

```tsx
<FormFieldWrapper name="email" label="Email" error={errors.email?.message}>
  {(props) => <Input {...props} {...register("email")} />}
</FormFieldWrapper>
```

---

### `applyServerFieldErrors(form, error)`

Map backend validation errors to form fields.

**Parameters:**

- `form: UseFormReturn` - react-hook-form instance
- `error: unknown` - Error from API call

**Returns:** `boolean` - `true` if errors applied, `false` otherwise

**Example:**

```tsx
if (!applyServerFieldErrors(form, error)) {
  toast.error(getFormErrorMessage(error));
}
```

---

### `getFormErrorMessage(error)`

Extract user-facing message from error.

**Parameters:**

- `error: unknown` - Error from API call

**Returns:** `string` - User-friendly message

**Example:**

```tsx
const message = getFormErrorMessage(error);
// => "Something went wrong. Please try again."
```

---

### `getFieldErrorMessage(errors, name)`

Extract error message for specific field.

**Parameters:**

- `errors: FieldErrors` - react-hook-form errors object
- `name: string` - Field name (supports nested: `"user.email"`)

**Returns:** `string | undefined`

**Example:**

```tsx
const emailError = getFieldErrorMessage(form.formState.errors, "email");
```

---

## Examples

### Basic Login Form

```tsx
import { z } from "zod";
import { useZodForm, FormFieldWrapper, Input, Button } from "@atlas/ui";
import { applyServerFieldErrors, getFormErrorMessage } from "@atlas/ui";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Too short"),
});

function LoginForm() {
  const form = useZodForm(loginSchema);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const [rootError, setRootError] = React.useState<string | null>(null);

  const onSubmit = async (data) => {
    try {
      await api.auth.login(data);
    } catch (error) {
      if (!applyServerFieldErrors(form, error)) {
        setRootError(getFormErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {rootError && <div role="alert">{rootError}</div>}

      <FormFieldWrapper name="email" label="Email" error={errors.email?.message} required>
        {(props) => <Input {...props} type="email" {...register("email")} />}
      </FormFieldWrapper>

      <FormFieldWrapper name="password" label="Password" error={errors.password?.message} required>
        {(props) => <Input {...props} type="password" {...register("password")} />}
      </FormFieldWrapper>

      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

### Form with Textarea and Select

```tsx
import { Textarea, Select, SelectTrigger, SelectContent, SelectItem } from "@atlas/ui";

const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message too short"),
});

function FeedbackForm() {
  const form = useZodForm(feedbackSchema);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormFieldWrapper name="category" label="Category" error={errors.category?.message} required>
        {(props) => (
          <Select {...register("category")}>
            <SelectTrigger {...props}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
            </SelectContent>
          </Select>
        )}
      </FormFieldWrapper>

      <FormFieldWrapper
        name="message"
        label="Message"
        helpText="Describe your feedback in detail."
        error={errors.message?.message}
        required
      >
        {(props) => <Textarea {...props} {...register("message")} rows={5} />}
      </FormFieldWrapper>

      <Button type="submit">Submit Feedback</Button>
    </form>
  );
}
```

### Nested Object Validation

```tsx
const addressSchema = z.object({
  user: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
  }),
});

function AddressForm() {
  const form = useZodForm(addressSchema);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form>
      <FormFieldWrapper name="user.name" label="Name" error={errors.user?.name?.message}>
        {(props) => <Input {...props} {...register("user.name")} />}
      </FormFieldWrapper>

      <FormFieldWrapper name="address.city" label="City" error={errors.address?.city?.message}>
        {(props) => <Input {...props} {...register("address.city")} />}
      </FormFieldWrapper>
    </form>
  );
}
```

---

## Testing Forms

### Unit Testing with Jest

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

test("shows validation errors on invalid input", async () => {
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole("button", { name: /sign in/i });

  // Trigger validation
  await userEvent.type(emailInput, "invalid");
  await userEvent.click(submitButton);

  // Check for error message
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  // Check aria-invalid
  expect(emailInput).toHaveAttribute("aria-invalid", "true");
});

test("applies server field errors", async () => {
  // Mock API to return validation error
  vi.spyOn(api.auth, "login").mockRejectedValue({
    shape: {
      code: "VALIDATION_FAILED",
      details: {
        fieldErrors: {
          email: ["Email already registered"],
        },
      },
    },
  });

  render(<LoginForm />);

  // Submit form
  await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  // Check server error is shown
  await waitFor(() => {
    expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
  });
});
```

---

## Migration from Existing Forms

If you have existing forms using shadcn's `Form` component:

### Before

```tsx
<Form {...form}>
  <form>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Enter your email</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### After

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  <FormFieldWrapper
    name="email"
    label="Email"
    helpText="Enter your email"
    error={errors.email?.message}
  >
    {(props) => <Input {...props} {...register("email")} />}
  </FormFieldWrapper>
</form>
```

**Benefits:**

- Less boilerplate (no `render` prop, `FormItem`, `FormControl`)
- Accessibility guaranteed (can't forget `aria-describedby`)
- Server validation built-in
- Easier to read and maintain

---

## Best Practices

1. **Always define schema first** - Don't write validation inline
2. **Use `useZodForm`** - Don't use `useForm` directly
3. **Use `FormFieldWrapper`** - Don't wire accessibility manually
4. **Handle server errors** - Always use `applyServerFieldErrors`
5. **Show root errors** - Display non-field errors prominently
6. **Required fields** - Mark with `required` prop
7. **Help text** - Provide context for complex fields
8. **Test accessibility** - Verify aria attributes with axe-core

---

## Troubleshooting

### "Field not registering"

Make sure you spread both `{...props}` and `{...register()}`:

```tsx
<Input {...props} {...register("email")} />
```

### "Server errors not applying"

Check:

1. Error has `code: "VALIDATION_FAILED"`
2. Error has `details.fieldErrors` structure
3. Field names match exactly

### "Accessibility warnings"

Ensure:

1. Every field has a `label` prop
2. Spread `{...props}` on the control
3. Error IDs don't conflict

---

## Related Documentation

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [WCAG Form Guidelines](https://www.w3.org/WAI/tutorials/forms/)
- [Atlas API Error Handling](./DATA_FETCHING.md#error-handling)
