import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Separator } from "./separator";

const itemVariants = cva("flex w-full items-start gap-4 rounded-md p-4 transition-colors", {
  variants: {
    variant: {
      default: "bg-muted/50",
      outline: "border border-input bg-background shadow-sm shadow-black/5",
      muted: "bg-muted",
    },
    size: {
      default: "p-4",
      sm: "p-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Item({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="item"
      className={cn(
        itemVariants({ variant, size }),
        asChild &&
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-group"
      role="list"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" className={className} {...props} />;
}

const itemMediaVariants = cva("flex shrink-0 items-center justify-center", {
  variants: {
    variant: {
      default: "size-10",
      icon: "size-10 rounded-md bg-muted",
      image: "size-10 overflow-hidden rounded-md",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function ItemMedia({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      className={cn(itemMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="item-title" className={cn("leading-none font-medium", className)} {...props} />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex shrink-0 items-center gap-2", className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex items-center", className)} {...props} />;
}

export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
};
