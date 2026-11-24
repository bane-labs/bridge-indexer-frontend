import { deriveComparisonSummary } from "./bridge-comparison";

test.each([
  [{ nonce: 1 }, { nonce: 1 }],
  [{ nonce: 1, root: "0xaa" }, { nonce: 1 }],
  [{ nonce: 1 }, { nonce: 1, root: "0xbb" }],
])("missing roots leave comparison unavailable", (source, destination) => {
  expect(deriveComparisonSummary(source, destination)).toBe("unavailable");
});
