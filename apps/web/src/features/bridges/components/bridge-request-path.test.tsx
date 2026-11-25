import { screen, within } from "@testing-library/react";
import { rest } from "msw";
import nodeFetch, { Headers as NodeHeaders } from "node-fetch";
import { URL as NodeURL } from "url";

import { renderWithProviders, server, mockRouterState } from "@/test";
import {
  liveIndexerState,
  reverseDetailSync,
  reverseDetailOperation,
  paginatedDetailOperations,
  claimedDetailOperation,
  startupHealth,
  legacyBridgeHealth,
  detailSync,
  rootMismatchSync,
  destinationAheadSync,
  destinationSymbolSync,
  otherPairSync,
  detailOperation,
  otherPairOperation,
} from "@/test/fixtures/bridge-health";

import type { BridgeDirectionSlug } from "../lib/bridge-slugs";

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
  expect(await screen.findByText("All directions unpaused")).toBeInTheDocument();
});

test("shows a health request failure with zero sync instances", async () => {
  server.use(rest.get("*/health", (_req, res, ctx) => res(ctx.status(503))));
  renderWithProviders(<BridgeDashboardClient />);
  expect(
    await screen.findByText("Could not load bridge health.", {}, { timeout: 10000 })
  ).toBeInTheDocument();
});

function DetailRequest({
  slug = "token-ndmeme",
  direction = "n3-to-x",
}: {
  slug?: string;
  direction?: BridgeDirectionSlug;
}) {
  const { data } = useBridgeHistory(slug, direction);
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
  expect(screen.getByText("source")).toBeInTheDocument();
  expect(screen.getByText("destination")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Observed bridge state" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Configuration" })).toBeInTheDocument();
  expect(screen.getByText(/contract configuration is unavailable/i)).toBeInTheDocument();
  expect(screen.getByLabelText("Operation: Pending")).toBeInTheDocument();
  expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: "Copy source state root" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Copy destination state root" })
  ).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Operation: Delayed")).not.toBeInTheDocument();
});

test("legacy token URLs display a unique backend token pair", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync, reverseDetailSync])))
  );
  renderWithProviders(<DetailRequest slug="token-ndmeme" />);
  const pair = await screen.findByRole("region", { name: "Token pair identity" });
  expect(within(pair).getByText("aaa")).toBeInTheDocument();
  expect(within(pair).getByText("bbb")).toBeInTheDocument();
  expect(within(pair).queryByText(/identity unavailable/i)).not.toBeInTheDocument();
});

test("legacy token URLs do not choose between multiple or incomplete backend pairs", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync, otherPairSync])))
  );
  const { unmount } = renderWithProviders(<DetailRequest slug="token-ndmeme" />);
  expect(await screen.findByText(/exact token-pair identity unavailable/i)).toBeInTheDocument();
  unmount();

  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([{ ...detailSync, dst_token: undefined }]))
    )
  );
  renderWithProviders(<DetailRequest slug="token-ndmeme" />);
  expect(await screen.findByText(/exact token-pair identity unavailable/i)).toBeInTheDocument();
});

test("legacy token URLs reject an observed history pair conflicting with sync state", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: [otherPairOperation], total: 1 }))
    )
  );
  renderWithProviders(<DetailRequest slug="token-ndmeme" />);
  expect(await screen.findByText(/exact token-pair identity unavailable/i)).toBeInTheDocument();
});

test("sync request failure does not hide operation history or token pair identity", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.status(503))),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: [detailOperation], total: 1 }))
    )
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(
    await screen.findByText("Could not load directional bridge state.", {}, { timeout: 10000 })
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Token pair identity" })).toBeInTheDocument();
  expect(screen.getByRole("table")).toBeInTheDocument();
});

test("operation history request failure leaves observed state visible", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))),
    rest.get("*/operations", (_req, res, ctx) => res(ctx.status(503)))
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(
    await screen.findByText("Could not load operation history.", {}, { timeout: 10000 })
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Observed bridge state" })).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
});

test.each(["native", "message"] as const)(
  "%s bridge shows its own directional observations without token contracts",
  async (bridgeFamily) => {
    server.use(
      rest.get("*/sync/instances", (_req, res, ctx) =>
        res(
          ctx.json([
            {
              ...detailSync,
              bridge_type: bridgeFamily,
              src_token: undefined,
              dst_token: undefined,
            },
          ])
        )
      )
    );
    renderWithProviders(<DetailRequest slug={bridgeFamily} />);
    expect(
      await screen.findByRole("heading", { name: "Observed bridge state" })
    ).toBeInTheDocument();
    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Token pair identity" })).not.toBeInTheDocument();
    expect(screen.getByText(/contract configuration is unavailable/i)).toBeInTheDocument();
  }
);

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
  expect(within(screen.getByRole("table")).getAllByRole("link")).toHaveLength(1);
});

test("health remains visible when sync fails", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.status(503)))
  );
  renderWithProviders(<BridgeDashboardClient />);
  expect(
    await screen.findByText("All directions unpaused", {}, { timeout: 10000 })
  ).toBeInTheDocument();
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
  expect(within(screen.getByRole("table")).getAllByRole("link")).toHaveLength(1);
});

test("destination-only symbols produce usable pair-specific dashboard links", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([destinationSymbolSync, otherPairSync]))
    )
  );
  const { user } = renderWithProviders(<BridgeDashboardClient />);
  const table = await screen.findByRole("table");
  const links = within(table).getAllByRole("link", { name: /View .* bridge details/ });
  await user.click(links[0]!);
  expect(mockRouterState.push).toHaveBeenLastCalledWith("/bridges/token-pair-aaa-bbb/n3-to-x");
  await user.click(links[1]!);
  expect(mockRouterState.push).toHaveBeenLastCalledWith("/bridges/token-pair-ccc-ddd/n3-to-x");
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
  expect(await screen.findByRole("heading", { name: "BBB Token Bridge" })).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
});

test("directional details keep the requested direction and optional liveness", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) =>
      res(ctx.json([detailSync, reverseDetailSync]))
    ),
    rest.get("*/indexer/state", (_req, res, ctx) => res(ctx.json(liveIndexerState))),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: [detailOperation, reverseDetailOperation], total: 2 }))
    )
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" direction="x-to-n3" />);
  expect((await screen.findAllByText("77")).length).toBeGreaterThan(0);
  expect(screen.getByText("42")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "View operation 77 details" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "View operation 42 details" })
  ).not.toBeInTheDocument();
  expect(await screen.findAllByText("Indexer liveness")).toHaveLength(2);
  expect(screen.getAllByText("Indexed block:").length).toBe(4);
});

test("merged history retains pagination", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: paginatedDetailOperations, total: 11 }))
    )
  );
  const { user } = renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  const table = await screen.findByRole("table");
  expect(within(table).getAllByRole("row")).toHaveLength(11);
  await user.click(screen.getByLabelText("Go to next page"));
  expect(within(table).getAllByRole("row")).toHaveLength(2);
});

test("a reported stuck operation retains its claim link without asserting settlement", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))),
    rest.get("*/operations", (_req, res, ctx) =>
      res(ctx.json({ operations: [claimedDetailOperation], total: 1 }))
    )
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  const table = await screen.findByRole("table");
  expect(within(table).getByText("Stuck (reported)")).toBeInTheDocument();
  const claim = within(table).getByRole("link", { name: /Transaction 0x11111111/ });
  expect(claim.getAttribute("href")).toContain(claimedDetailOperation.claim_tx_hash);
});

test("equal nonces do not assert sync when the backend reports a root mismatch", async () => {
  server.use(rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([rootMismatchSync]))));
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(await screen.findByLabelText("Operation: Root mismatch")).toBeInTheDocument();
  expect(screen.getByText("0 nonce difference")).toBeInTheDocument();
  expect(screen.queryByText(/In sync/)).not.toBeInTheDocument();
});

test("negative nonce differences describe the destination as ahead", async () => {
  server.use(
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([destinationAheadSync])))
  );
  renderWithProviders(<DetailRequest slug="token-pair-aaa-bbb" />);
  expect(await screen.findByText("Destination ahead by 1")).toBeInTheDocument();
  expect(screen.queryByText(/1 behind/)).not.toBeInTheDocument();
});

test("dashboard labels the latest bridge observation independently of polling", async () => {
  server.use(
    rest.get("*/health", (_req, res, ctx) => res(ctx.json(legacyBridgeHealth))),
    rest.get("*/sync/instances", (_req, res, ctx) => res(ctx.json([detailSync]))),
    rest.get("*/indexer/state", (_req, res, ctx) => res(ctx.json(liveIndexerState)))
  );
  renderWithProviders(<BridgeDashboardClient />);
  const observation = await screen.findByText(/^Latest bridge observation /);
  expect(observation.getAttribute("title")).toBe(detailSync.src_observed_at);
  expect(screen.queryByText(/^Refreshed /)).not.toBeInTheDocument();
});
