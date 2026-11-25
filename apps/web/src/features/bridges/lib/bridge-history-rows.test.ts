import { detailOperation } from "@/test/fixtures/bridge-health";

import { buildRows } from "./bridge-history-rows";

test("preserves reported stuck status without inferring relay or claimability", () => {
  const [row] = buildRows(
    [{ ...detailOperation, status: "stuck", dest_tx_hash: undefined }],
    "deposit"
  );
  expect(row).toMatchObject({
    status: "stuck",
    claimTxHash: undefined,
    completionTimestamp: undefined,
  });
  expect(row).not.toHaveProperty("settlementStatus");
});

test("preserves a claim hash as evidence without rewriting backend status", () => {
  const [row] = buildRows(
    [{ ...detailOperation, status: "stuck", claim_tx_hash: "0xclaim" }],
    "deposit"
  );
  expect(row).toMatchObject({ status: "stuck", claimTxHash: "0xclaim" });
});

test("does not interpret source-completed message as destination execution", () => {
  const [row] = buildRows(
    [
      {
        ...detailOperation,
        bridge_type: "message",
        status: "completed",
        amb_message_type: "store_only",
        completion_timestamp: detailOperation.timestamp,
        dest_tx_hash: undefined,
      },
    ],
    "deposit"
  );
  expect(row).toMatchObject({
    status: "completed",
    completionTimestamp: detailOperation.timestamp,
    destinationTxHash: undefined,
  });
  expect(row).not.toHaveProperty("settledAt");
});
