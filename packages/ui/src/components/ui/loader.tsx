import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

interface SpinnerIconProps extends React.ComponentProps<"svg"> {
  barCount?: number;
}

function SpinnerIcon({ className, barCount = 12, ...props }: SpinnerIconProps) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const angle = (360 / barCount) * i;
    const delay = -(1 / barCount) * (barCount - 1 - i);
    return { angle, delay, index: i + 1 };
  });

  const animationStyles = bars
    .map(
      ({ index, delay }) =>
        `.spinner-bar-${index} { animation: spinner-fade 1s steps(${barCount}, end) infinite; animation-delay: ${delay.toFixed(4)}s; }`
    )
    .join("\n            ");

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <style>
        {`
            @keyframes spinner-fade {
              0% { opacity: 1; }
              100% { opacity: 0.15; }
            }
            ${animationStyles}
          `}
      </style>
      <g>
        {bars.map(({ angle, index }) => (
          <rect
            key={index}
            x="11"
            y="1"
            width="2"
            height="6"
            rx="1"
            fill="currentColor"
            transform={angle > 0 ? `rotate(${angle} 12 12)` : undefined}
            className={`spinner-bar-${index}`}
          />
        ))}
      </g>
    </svg>
  );
}

const loaderVariants = cva("", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
    variant: {
      spinner: "",
      dots: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "spinner",
  },
});

export interface LoaderProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof loaderVariants> {
  label?: string;
}

function Loader({
  className,
  size,
  variant = "spinner",
  label = "Loading",
  ...props
}: LoaderProps) {
  let barCount = 12;
  if (size === "sm") barCount = 8;
  else if (size === "md") barCount = 10;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <SpinnerIcon
        className={cn(loaderVariants({ size, variant }))}
        barCount={barCount}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function InlineLoader({
  className,
  label = "Loading",
  ...props
}: Omit<LoaderProps, "size" | "variant">) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      <SpinnerIcon className="size-4" barCount={8} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export interface PageLoaderProps extends React.ComponentProps<"div"> {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

function PageLoader({ className, title, description, size = "lg", ...props }: PageLoaderProps) {
  let sizeClass = "size-8";
  let barCount = 12;

  if (size === "sm") {
    sizeClass = "size-4";
    barCount = 8;
  } else if (size === "md") {
    sizeClass = "size-6";
    barCount = 10;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title || "Loading page"}
      data-slot="page-loader"
      className={cn("flex min-h-100 flex-col items-center justify-center gap-4 p-6", className)}
      {...props}
    >
      <SpinnerIcon className={cn(sizeClass)} barCount={barCount} aria-hidden="true" />
      {title && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-foreground text-sm font-medium">{title}</p>
          {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
        </div>
      )}
      <span className="sr-only">{title || "Loading page"}</span>
    </div>
  );
}

export { InlineLoader, Loader, loaderVariants, PageLoader };
