import { screen, within } from "@testing-library/react";
import { rest } from "msw";
import nodeFetch, { Headers as NodeHeaders } from "node-fetch";
import { URL as NodeURL } from "url";

import { renderWithProviders, server } from "@/test";
import {
  startupHealth,
  legacyBridgeHealth,
  detailSync,
  destinationSymbolSync,
  otherPairSync,
  detailOperation,
  otherPairOperation,
} from "@/test/fixtures/bridge-health";

import { useBridgeHistory } from "../hooks/use-bridge-history";
import { BridgeDashboardClient } from "./bridge-dashboard-client";
import { BridgeDetailView } from "./bridge-detail-view";

// MSW v1 intercepts Node's HTTP transport rather than the native fetch transport.
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
  global.URL = NodeURL as unknown as typeof global.URL;
  global.fetch = nodeFetch as unknown as typeof global.fetch;
  global.Headers = NodeHeaders as unknown as typeof global.Headers;
});

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([]))),
    rest.get("*/indexer/state", (_req, res, ctx) => res(ctx.status(503))),
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

function DetailRequest({ slug = "token-ndmeme" }: { slug?: string }) {
  const { data } = useBridgeHistory(slug);
  return data ? <BridgeDetailView {...data} /> : <p>Loading</p>;
}

test("detail cards render backend state when history is empty and indexer state is unavailable", async () => {
  server.use(rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))));
  renderWithProviders(<DetailRequest />);
  expect(await screen.findByText("42")).toBeInTheDocument();
  expect(screen.getByText("0xsource")).toBeInTheDocument();
  expect(screen.getByText("Block #123")).toBeInTheDocument();
  expect(screen.getByLabelText("Indexer: Unknown")).toBeInTheDocument();
  expect(screen.getByText("Block Unavailable")).toBeInTheDocument();
  expect(screen.getByText("Observed Unavailable")).toBeInTheDocument();
  expect(screen.getByText("requested")).toBeInTheDocument();
  expect(screen.getByText("relayed")).toBeInTheDocument();
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

test("health remains visible when sync fails", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.status(503)))
  );
  renderWithProviders(<BridgeDashboardClient />);
  expect(await screen.findByText("Healthy", {}, { timeout: 10000 })).toBeInTheDocument();
  expect(screen.getByText(/could not load bridge sync state/i)).toBeInTheDocument();
});

test("unknown directions have a visible count and filter", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([{ ...detailSync, status: "unknown", reason: "MISSING_STATE" }]))
    )
  );
  const { user } = renderWithProviders(<BridgeDashboardClient />);
  await screen.findByRole("table");
  const countLabel = screen.getByText("Unknown", { selector: "span" });
  expect(countLabel.parentElement).toHaveTextContent("1");
  await user.click(screen.getByRole("button", { name: "Unknown" }));
  expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2);
});

test("destination-only symbols produce usable pair-specific dashboard links", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([destinationSymbolSync, otherPairSync]))
    )
  );
  renderWithProviders(<BridgeDashboardClient />);
  const table = await screen.findByRole("table");
  const links = within(table).getAllByRole("link", { name: "Details →" });
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    "/bridges/token-pair-aaa-bbb",
    "/bridges/token-pair-ccc-ddd",
  ]);
  expect(within(table).getAllByText("NDMEME")).toHaveLength(2);
});

test("pair detail requests isolate same-symbol operations and sync instances", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([destinationSymbolSync, otherPairSync]))
    ),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: [detailOperation, otherPairOperation], total: 2 }))
    )
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(await screen.findByRole("heading", { name: "NDMEME Token Bridge" })).toBeInTheDocument();
  expect(screen.getAllByText("42").length).toBeGreaterThan(0);
  expect(screen.queryByText("999")).not.toBeInTheDocument();
  expect(screen.queryByText("0xother")).not.toBeInTheDocument();
});

test("unresolved token symbols can still open an exact pair detail page", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([{ ...detailSync, src_token_symbol: undefined, dst_token_symbol: undefined }]))
    )
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(await screen.findByRole("heading", { name: "AAA Token Bridge" })).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
});
