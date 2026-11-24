import { getBridgeSlug, parseBridgeSlug } from "./bridge-slugs";
import { getTokenPairId } from "./bridge-token-matching";

test("both directions and address prefixes share a canonical pair route", () => {
  const forward = getTokenPairId("neo_n3", "0xAAA", "bbb");
  const reverse = getTokenPairId("neo_x", "0xBBB", "aaa");
  expect(reverse).toBe(forward);
  const slug = getBridgeSlug("token", "SAME", forward, "forward");
  expect(slug).toBe("token-pair-aaa-bbb");
  expect(parseBridgeSlug(slug)).toEqual({ bridgeFamily: "token", tokenPairId: forward });
});

test("same-symbol pairs have distinct routes and symbol links remain supported", () => {
  expect(getBridgeSlug("token", "SAME", "aaa:bbb")).not.toBe(
    getBridgeSlug("token", "SAME", "aaa:ccc")
  );
  expect(parseBridgeSlug("token-same")).toEqual({ bridgeFamily: "token", tokenSymbol: "SAME" });
});

test("an incomplete pair still has an exact instance route without a symbol", () => {
  const id = "token|neo_n3->neo_x|unknown|bbb";
  const slug = getBridgeSlug("token", undefined, undefined, id);
  expect(parseBridgeSlug(slug)).toEqual({ bridgeFamily: "token", instanceId: id });
  expect(getTokenPairId("neo_n3", "unknown", "0xbbb")).toBeUndefined();
  expect(parseBridgeSlug("token-pair-unknown-bbb")).toBeNull();
});
