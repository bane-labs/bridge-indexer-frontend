import { render, screen } from "@testing-library/react";

import { getOperationalHealth } from "../lib/operational-health";
import { OperationalHealthSummary } from "./operational-health-summary";

import type { BackendOperationalHealth } from "../types/backend-api";

const snapshot: BackendOperationalHealth = {
  apiVersion: "v1",
  overallStatus: "unhealthy",
  checkedAt: "2026-11-18T10:00:00Z",
  summary: "An open bridge direction needs attention.",
  issueCount: 1,
  issues: [
    {
      code: "indexer_stalled",
      severity: "critical",
      chain: "neo_x",
      message: "Neo X indexing has stalled.",
    },
  ],
  bridges: [
    {
      bridgeType: "native",
      directions: [
        { srcChain: "neo_x", dstChain: "neo_n3", paused: true },
        { srcChain: "neo_n3", dstChain: "neo_x", paused: false },
      ],
      pending: 0,
      stuck: 0,
    },
  ],
};

test("shows the backend verdict, issue, check time and pause state", () => {
  render(<OperationalHealthSummary health={getOperationalHealth(snapshot)} />);

  expect(screen.getByText("Unhealthy")).toBeInTheDocument();
  expect(screen.getByText("Neo X indexing has stalled.")).toBeInTheDocument();
  expect(screen.getByText(/^Checked /)).toBeInTheDocument();
  expect(screen.getByText(/· Paused/)).toBeInTheDocument();
  expect(screen.getByText(/· Open/)).toBeInTheDocument();
});

test("shows startup observations as unknown", () => {
  render(
    <OperationalHealthSummary
      health={{ ...snapshot, overallStatus: "unknown", checkedAt: null, issueCount: 0, issues: [] }}
    />
  );

  expect(screen.getByText("Health unknown")).toBeInTheDocument();
  expect(screen.getByText("Waiting for the first health check.")).toBeInTheDocument();
});

test("distinguishes the legacy response from a failed request", () => {
  const { rerender } = render(
    <OperationalHealthSummary
      health={getOperationalHealth({ status: "healthy", bridges: [], updated_at: "" })}
    />
  );

  expect(screen.getByText("Operational health is unavailable.")).toBeInTheDocument();
  rerender(<OperationalHealthSummary health={getOperationalHealth(undefined)} />);
  expect(screen.getByText("Could not load bridge health.")).toBeInTheDocument();
});
