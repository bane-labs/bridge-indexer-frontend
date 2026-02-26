import { cva, type VariantProps } from "class-variance-authority";
import { InboxIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-center text-balance",
  {
    variants: {
      variant: {
        default: "rounded-lg border border-dashed p-6 md:p-12",
        compact: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface EmptyStateProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof emptyStateVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

function EmptyState({
  className,
  variant,
  title,
  description,
  icon,
  actions,
  ...props
}: EmptyStateProps) {
  const defaultIcon = icon !== undefined ? icon : <InboxIcon className="size-10" />;

  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ variant, className }))}
      {...props}
    >
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        {defaultIcon && (
          <div
            className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            {defaultIcon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-muted-foreground max-w-md text-sm/relaxed">{description}</p>
          )}
        </div>
        {actions && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { EmptyState, emptyStateVariants };
