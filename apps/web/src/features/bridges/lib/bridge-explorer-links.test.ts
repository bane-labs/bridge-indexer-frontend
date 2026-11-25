import { webcrypto } from "node:crypto";

import { getExplorerAddressUrl, getExplorerContractUrl } from "./bridge-explorer-links";

const originalSubtle = Object.getOwnPropertyDescriptor(globalThis.crypto, "subtle");
beforeAll(() => {
  Object.defineProperty(globalThis.crypto, "subtle", {
    configurable: true,
    value: webcrypto.subtle,
  });
});
afterAll(() => {
  if (originalSubtle) Object.defineProperty(globalThis.crypto, "subtle", originalSubtle);
  else delete (globalThis.crypto as { subtle?: SubtleCrypto }).subtle;
});

test("normalizes backend address hashes for the corresponding account explorer", async () => {
  const hash = ["d237b0efebfde5963339", "4c6ef04485c241ab2e62"].join("");
  expect(await getExplorerAddressUrl("neo_n3", hash)).toBe(
    "https://dora.coz.io/address/neo3/mainnet/Nf5VoXhHy9Ce6SeTovaVUZBUrnL3HNGtSK"
  );
  expect(await getExplorerAddressUrl("neo_x", "a".repeat(40))).toBe(
    `https://xexplorer.neo.org/address/0x${"a".repeat(40)}`
  );
});

test("rejects unrecognized addresses and contracts rather than constructing a bad link", async () => {
  expect(await getExplorerAddressUrl("neo_n3", "not-a-hash")).toBeUndefined();
  expect(
    await getExplorerAddressUrl("neo_x", "Nf5VoXhHy9Ce6SeTovaVUZBUrnL3HNGtSK")
  ).toBeUndefined();
  expect(getExplorerContractUrl("neo_n3", "invalid-contract")).toBeUndefined();
  expect(getExplorerContractUrl("neo_n3", "b".repeat(40))).toBe(
    `https://dora.coz.io/contract/neo3/mainnet/0x${"b".repeat(40)}`
  );
});
