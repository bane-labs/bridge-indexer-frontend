import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const skeletonVariants = cva("bg-accent animate-pulse", {
  variants: {
    radius: {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
    },
  },
  defaultVariants: {
    radius: "md",
  },
});

export interface SkeletonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, radius, ...props }: SkeletonProps) {
  return (
    <div data-slot="skeleton" className={cn(skeletonVariants({ radius, className }))} {...props} />
  );
}

export interface SkeletonTextProps extends React.ComponentProps<"div"> {
  lines?: number;
  lineClassName?: string;
}

function SkeletonText({ className, lines = 3, lineClassName, ...props }: SkeletonTextProps) {
  return (
    <div data-slot="skeleton-text" className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-4/5" : "w-full", lineClassName)}
        />
      ))}
    </div>
  );
}

const skeletonListVariants = cva("space-y-3", {
  variants: {
    variant: {
      list: "space-y-3",
      card: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    },
  },
  defaultVariants: {
    variant: "list",
  },
});

export interface SkeletonListProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonListVariants> {
  count?: number;
  itemClassName?: string;
  renderItem?: (index: number) => React.ReactNode;
}

function SkeletonList({
  className,
  count = 5,
  variant,
  itemClassName,
  renderItem,
  ...props
}: SkeletonListProps) {
  const defaultItem = (index: number) => (
    <div key={index} className={cn("space-y-3", itemClassName)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );

  return (
    <div
      data-slot="skeleton-list"
      className={cn(skeletonListVariants({ variant, className }))}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (renderItem ? renderItem(i) : defaultItem(i)))}
    </div>
  );
}

export { Skeleton, SkeletonList, SkeletonText, skeletonVariants };
