/**
 * Example Button Component
 *
 * Simple example component for demonstration.
 */

import React from "react";

export interface ExampleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function ExampleButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: ExampleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={variant === "primary" ? "btn-primary" : "btn-secondary"}
    >
      {children}
    </button>
  );
}
