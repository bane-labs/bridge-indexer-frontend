import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border border-border bg-muted/40 text-foreground/80 [a&]:hover:bg-muted/60",
        primary:
          "border border-primary/20 bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border border-border bg-muted/60 text-foreground/80 [a&]:hover:bg-muted/80",
        destructive:
          "border border-destructive/20 bg-destructive/10 text-destructive-text [a&]:hover:bg-destructive/15",
        outline: "border border-border bg-transparent text-foreground/80 [a&]:hover:bg-muted/40",
        success:
          "border border-success/20 bg-success/10 text-success-text [a&]:hover:bg-success/15",
        warning:
          "border border-warning/20 bg-warning/10 text-warning-text [a&]:hover:bg-warning/15",
        info: "border border-info/20 bg-info/10 text-info-text [a&]:hover:bg-info/15",
      },
      size: {
        default: "px-2 py-0.5 text-xs gap-1 [&>svg]:size-3",
        xs: "px-1.5 py-0 text-[10px] gap-0.5 [&>svg]:size-2.5",
        sm: "px-1.5 py-0.5 text-xs gap-1 [&>svg]:size-3",
        lg: "px-3 py-1 text-sm gap-1.5 [&>svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
