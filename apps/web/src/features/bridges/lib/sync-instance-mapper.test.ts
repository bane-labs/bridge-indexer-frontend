import { buildDashboardData } from "./bridge-status";
import { mapSyncInstancesToStatuses } from "./sync-instance-mapper";

import type { BackendDirectionalInstanceSync } from "../types/backend-api";

const instance: BackendDirectionalInstanceSync = {
  id: "token-forward",
  bridge_type: "token",
  src_chain: "neo_n3",
  dst_chain: "neo_x",
  src_token: "n3-a",
  dst_token: "x-a",
  src_token_symbol: "GAS",
  status: "source_ahead",
  reason: "SOURCE_NONCE_GREATER_THAN_DESTINATION",
  src_nonce: 10,
  dst_nonce: 1,
  delta_nonce: 9,
  src_block_number: 0,
  src_observed_at: "2026-11-18T10:01:00Z",
  dst_block_number: 88,
  dst_observed_at: "2026-11-18T10:00:00Z",
};
const missingIndexers = { neo_n3: null, neo_x: null };

test("maps each side's observations and preserves source-ahead without guessing relay age", () => {
  const [direction] = mapSyncInstancesToStatuses([instance], missingIndexers);

  expect(direction.source).toMatchObject({
    nonce: 10,
    blockNumber: 0,
    updatedAt: instance.src_observed_at,
  });
  expect(direction.destination).toMatchObject({
    nonce: 1,
    blockNumber: 88,
    updatedAt: instance.dst_observed_at,
  });
  expect(direction.operationStatus).toBe("pending");
  expect(direction.indexerStatus).toBe("unknown");
});

test("keeps partial observations and groups token directions by contract pair", () => {
  const directions = mapSyncInstancesToStatuses(
    [
      instance,
      {
        ...instance,
        id: "token-reverse",
        src_chain: "neo_x",
        dst_chain: "neo_n3",
        src_token: "x-a",
        dst_token: "n3-a",
      },
      {
        ...instance,
        id: "another-token",
        dst_token: "x-b",
        dst_nonce: undefined,
        dst_block_number: undefined,
        dst_observed_at: undefined,
        status: "unknown",
        reason: "MISSING_STATE",
      },
    ],
    missingIndexers
  );

  expect(directions[2].destination).toEqual({});
  expect(directions[2].operationStatus).toBe("unknown");
  expect(buildDashboardData(directions).groups.map((group) => group.directions.length)).toEqual([
    2, 1,
  ]);
});
