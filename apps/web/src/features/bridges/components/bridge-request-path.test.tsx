import { screen, within } from "@testing-library/react";
import { rest } from "msw";

import { renderWithProviders, server } from "@/test";
import { startupHealth, legacyBridgeHealth, detailSync } from "@/test/fixtures/bridge-health";

import { useBridgeHistory } from "../hooks/use-bridge-history";
import { BridgeDashboardClient } from "./bridge-dashboard-client";
import { BridgeDetailView } from "./bridge-detail-view";

// MSW v1 intercepts Node's HTTP transport rather than the native fetch transport.
const nodeFetch = require("node-fetch");
const originalFetch = global.fetch;
const originalHeaders = global.Headers;
const originalURL = global.URL;
const originalApiURL = process.env.NEXT_PUBLIC_API_URL;

afterAll(() => {
  global.fetch = originalFetch;
  global.Headers = originalHeaders;
  global.URL = originalURL;
  if (originalApiURL === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = originalApiURL;
});

beforeAll(() => {
  global.URL = require("url").URL;
  global.fetch = nodeFetch;
  global.Headers = nodeFetch.Headers;
});

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([]))),
    rest.get("*/indexer/state", (_req, res, ctx) => res(ctx.json({ neo_n3: null, neo_x: null }))),
    rest.get("*/operations", (_req, res, ctx) => res(ctx.json({ operations: [], total: 0 })))
  );
});

test("shows startup health with zero sync instances", async () => {
  server.use(rest.get("*/health", (_req, res, ctx) => res(ctx.json(startupHealth))));
  renderWithProviders(<BridgeDashboardClient />);
  expect(await screen.findByText("Health unknown")).toBeInTheDocument();
  expect(screen.getByText("Waiting for the first health check.")).toBeInTheDocument();
});

test("shows the current backend verdict with zero sync instances", async () => {
  server.use(rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))));
  renderWithProviders(<BridgeDashboardClient />);
  expect(await screen.findByText("Healthy")).toBeInTheDocument();
});

test("shows a health request failure with zero sync instances", async () => {
  server.use(rest.get("*/health", (_req, res, ctx) => res(ctx.status(503))));
  renderWithProviders(<BridgeDashboardClient />);
  expect(
    await screen.findByText("Could not load bridge health.", {}, { timeout: 10000 })
  ).toBeInTheDocument();
});

function DetailRequest() {
  const { data } = useBridgeHistory("token-ndmeme");
  return data ? <BridgeDetailView {...data} /> : <p>Loading</p>;
}

test("detail cards render backend state even when operation history is empty", async () => {
  server.use(rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))));
  renderWithProviders(<DetailRequest />);
  expect(await screen.findByText("42")).toBeInTheDocument();
  expect(screen.getByText("0xsource")).toBeInTheDocument();
  expect(screen.getByText("#123")).toBeInTheDocument();
  expect(screen.getByLabelText("Operation: Pending")).toBeInTheDocument();
  expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  expect(screen.queryByLabelText("Operation: Delayed")).not.toBeInTheDocument();
});

test("the delayed filter includes the root mismatch counted in the summary", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(
        ctx.json([
          {
            ...detailSync,
            status: "root_mismatch",
            reason: "ROOT_MISMATCH_AT_EQUAL_NONCE",
            dst_nonce: 42,
            delta_nonce: 0,
            dst_root: "0xdifferent",
          },
        ])
      )
    )
  );
  const { user } = renderWithProviders(<BridgeDashboardClient />);
  await screen.findByRole("table");
  await user.click(screen.getByRole("button", { name: "Delayed" }));
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
});
