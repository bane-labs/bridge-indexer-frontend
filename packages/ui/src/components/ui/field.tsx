import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Separator } from "./separator";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("group/fieldset space-y-4 border-none p-0", className)}
      {...props}
    />
  );
}

const fieldLegendVariants = cva("inline-block text-sm font-medium leading-none tracking-tight", {
  variants: {
    variant: {
      legend: "mb-1 text-base font-semibold",
      label: "",
    },
  },
  defaultVariants: {
    variant: "legend",
  },
});

function FieldLegend({
  className,
  variant,
  ...props
}: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(fieldLegendVariants({ variant }), className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      role="group"
      className={cn("space-y-4 **:data-[slot=checkbox-group]:space-y-3", className)}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field flex gap-4", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row items-start",
      responsive: "flex-col @[240px]/field-group:flex-row @[240px]/field-group:items-start",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

function Field({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      data-slot="field"
      role="group"
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex flex-1 flex-col gap-1.5 leading-snug", className)}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"label"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "label";
  return (
    <Comp
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "group-data-invalid/field:text-destructive inline-block text-sm leading-none font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-description"
      className={cn(
        "text-muted-foreground group-data-invalid/field:text-destructive text-sm",
        className
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Separator> & {
  children?: React.ReactNode;
}) {
  if (children) {
    return (
      <div data-slot="field-separator" className={cn("relative flex items-center py-4", className)}>
        <Separator className="flex-1" {...props} />
        <span className="text-muted-foreground px-2 text-xs">{children}</span>
        <Separator className="flex-1" />
      </div>
    );
  }

  return <Separator data-slot="field-separator" className={cn("my-4", className)} {...props} />;
}

function FieldError({
  className,
  errors,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: ({ message?: string } | undefined)[];
}) {
  const errorMessages = errors?.filter((e) => e?.message).map((e) => e!.message);
  const body = errorMessages?.length ? errorMessages : children;

  if (!body) return null;

  return (
    <div
      data-slot="field-error"
      role="alert"
      aria-live="polite"
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {Array.isArray(body) ? (
        <ul className="list-inside list-disc space-y-1">
          {body.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      ) : (
        body
      )}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
