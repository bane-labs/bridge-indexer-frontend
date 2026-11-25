import { screen, within } from "@testing-library/react";

import { renderWithProviders } from "@/test";

import { BridgeTokenPairIdentity } from "./bridge-token-pair-identity";

test("keeps both chain contract identities distinct with copy controls and correct links", async () => {
  const n3 = "a".repeat(40);
  const neoX = "b".repeat(40);
  const { user } = renderWithProviders(<BridgeTokenPairIdentity tokenPairId={`${n3}:${neoX}`} />);
  const section = screen.getByRole("region", { name: "Token pair identity" });
  expect(within(section).getByText(n3)).toBeInTheDocument();
  expect(within(section).getByText(neoX)).toBeInTheDocument();
  expect(
    within(section).getByRole("link", { name: "View Neo N3 token contract on explorer" })
  ).toHaveAttribute("href", `https://dora.coz.io/contract/neo3/mainnet/0x${n3}`);
  expect(
    within(section).getByRole("link", { name: "View Neo X token contract on explorer" })
  ).toHaveAttribute("href", `https://xexplorer.neo.org/address/0x${neoX}`);
  const copy = jest.spyOn(navigator.clipboard, "writeText");
  await user.click(within(section).getByRole("button", { name: "Copy Neo X token contract" }));
  expect(copy).toHaveBeenCalledWith(neoX);
  copy.mockRestore();
});

test("does not invent an explorer link for short or unavailable contract identities", () => {
  const { rerender } = renderWithProviders(<BridgeTokenPairIdentity tokenPairId="aaa:bbb" />);
  expect(
    screen.queryByRole("link", { name: /token contract on explorer/i })
  ).not.toBeInTheDocument();
  expect(screen.getAllByText("Explorer link unavailable")).toHaveLength(2);
  rerender(<BridgeTokenPairIdentity />);
  expect(screen.getByText(/exact token-pair identity unavailable/i)).toBeInTheDocument();
});
