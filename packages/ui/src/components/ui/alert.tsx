import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex items-center gap-3 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground [&_[data-slot=alert-description]]:text-muted-foreground",
        destructive:
          "bg-destructive/10 border-destructive/20 text-destructive-text [&_[data-slot=alert-description]]:text-destructive-text/90 [&>svg]:text-current",
        info: "bg-info/10 border-info/20 text-info-text [&_[data-slot=alert-description]]:text-info-text/90 [&>svg]:text-current",
        success:
          "bg-success/10 border-success/20 text-success-text [&_[data-slot=alert-description]]:text-success-text/90 [&>svg]:text-current",
        warning:
          "bg-warning/10 border-warning/20 text-warning-text [&_[data-slot=alert-description]]:text-warning-text/90 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("flex-1 text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

function AlertIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return <svg data-slot="alert-icon" className={cn("size-4 shrink-0", className)} {...props} />;
}

function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn("col-start-3 row-span-2 flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertActions, AlertDescription, AlertIcon, AlertTitle };
