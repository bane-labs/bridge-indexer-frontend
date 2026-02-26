"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

function RadioCards({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-cards"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioCardsItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-cards-item"
      className={cn(
        "text-foreground border-input hover:bg-muted/30 data-[state=checked]:border-primary group relative flex cursor-pointer rounded-lg border bg-transparent p-4 text-left transition-all outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-1 pr-6">{children}</div>
      <span
        data-slot="radio-cards-indicator"
        className="border-input text-primary dark:bg-input/30 absolute top-4 right-4 flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border shadow-xs transition-[color,box-shadow]"
      >
        <RadioGroupPrimitive.Indicator className="relative flex items-center justify-center">
          <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        </RadioGroupPrimitive.Indicator>
      </span>
    </RadioGroupPrimitive.Item>
  );
}

function RadioCardsTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="radio-cards-title"
      className={cn("text-sm leading-none font-medium", className)}
      {...props}
    />
  );
}

function RadioCardsDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="radio-cards-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { RadioCards, RadioCardsDescription, RadioCardsItem, RadioCardsTitle };
