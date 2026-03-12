"use client";

import { Badge } from "@atlas/ui";

import type { ComparisonSummary } from "../types/bridge-state";

const COMPARISON_CONFIG: Record<
  ComparisonSummary,
  { label: string; variant: "success" | "destructive" | "warning" | "secondary" }
> = {
  nonce_and_root_match: { label: "Nonce and root match", variant: "success" },
  nonce_mismatch: { label: "Nonce mismatch", variant: "destructive" },
  root_mismatch: { label: "Root mismatch", variant: "destructive" },
  nonce_and_root_mismatch: { label: "Nonce and root mismatch", variant: "destructive" },
  data_stale: { label: "Data stale", variant: "warning" },
};

interface ComparisonSummaryBadgeProps {
  summary: ComparisonSummary;
  className?: string;
}

export function ComparisonSummaryBadge({ summary, className }: ComparisonSummaryBadgeProps) {
  const config = COMPARISON_CONFIG[summary];

  return (
    <Badge variant={config.variant} size="sm" className={className} aria-label={config.label}>
      {config.label}
    </Badge>
  );
}
