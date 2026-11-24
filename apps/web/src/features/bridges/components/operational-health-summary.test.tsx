import { screen } from "@testing-library/react";

import { renderWithProviders as render } from "@/test";

import { getOperationalHealth } from "../lib/operational-health";
import { OperationalHealthSummary } from "./operational-health-summary";

import { legacyBridgeHealth } from "@/test/fixtures/bridge-health";

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
  expect(screen.getByText(/· Unpaused/)).toBeInTheDocument();
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

  expect(screen.getByText("Pause state unavailable")).toBeInTheDocument();
  rerender(<OperationalHealthSummary health={getOperationalHealth(undefined)} />);
  expect(screen.getByText("Could not load bridge health.")).toBeInTheDocument();
});

test("legacy pause state is compact and does not claim overall health", () => {
  render(
    <OperationalHealthSummary
      health={{
        ...legacyBridgeHealth,
        bridges: [
          {
            bridge_type: "native",
            status: "healthy",
            deposits_paused: false,
            withdrawals_paused: false,
          },
        ],
      }}
    />
  );
  expect(screen.getByRole("region", { name: "Bridge pauses" })).toBeInTheDocument();
  expect(screen.getByText("All directions unpaused")).toBeInTheDocument();
  expect(screen.queryByText("Healthy")).not.toBeInTheDocument();
  expect(screen.queryByText("Open")).not.toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(screen.queryByText(/Operational checks/)).not.toBeInTheDocument();
});

test("legacy pause details name only the affected direction", () => {
  render(
    <OperationalHealthSummary
      health={{
        ...legacyBridgeHealth,
        bridges: [
          {
            bridge_type: "token",
            status: "degraded",
            deposits_paused: false,
            withdrawals_paused: true,
          },
        ],
      }}
    />
  );
  expect(screen.getByText("1 direction paused")).toBeInTheDocument();
  expect(screen.getByText(/Neo X → Neo N3/)).toBeInTheDocument();
  expect(screen.queryByText(/Neo N3 → Neo X/)).not.toBeInTheDocument();
});
