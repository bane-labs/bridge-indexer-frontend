import { screen, within } from "@testing-library/react";

import { renderWithProviders } from "@/test";
import { detailOperation } from "@/test/fixtures/bridge-health";

import { formatTimestamp } from "../lib/formatters";

import { BridgeHistoryTable } from "./bridge-history-table";

import type { BackendBridgeOperation } from "../types/backend-api";
import type { BridgeOperationHistoryRow } from "../types/bridge-history";

function row(operation: BackendBridgeOperation): BridgeOperationHistoryRow {
  return {
    id: `${operation.bridge_type}:${operation.direction}:${operation.nonce}`,
    operation,
    nonce: operation.nonce,
    root: operation.root,
    sourceTxHash: operation.source_tx_hash,
    destinationTxHash: operation.dest_tx_hash,
    amount: operation.amount,
    status: "pending",
  };
}

test("opens from the row, preserves links, closes with Escape, and restores focus", async () => {
  const operation = {
    ...detailOperation,
    root: `0x${"a".repeat(64)}`,
    dest_tx_hash: `0x${"b".repeat(64)}`,
    completion_timestamp: "2026-11-19T10:00:00Z",
    from_address: "Nf5VoXhHy9Ce6SeTovaVUZBUrnL3HNGtSK",
    to_address: "0x5D66709462D096ec92706Ccd49e548C1c42cE114",
  };
  const { user } = renderWithProviders(
    <BridgeHistoryTable rows={[row(operation)]} sourceChain="neo_n3" destinationChain="neo_x" />
  );
  const trigger = screen.getByRole("button", { name: "View operation 42 details" });
  trigger.focus();
  await user.keyboard("{Enter}");

  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText(operation.root)).toBeInTheDocument();
  const copy = jest.spyOn(navigator.clipboard, "writeText");
  await user.click(within(dialog).getByRole("button", { name: "Copy root" }));
  expect(copy).toHaveBeenCalledWith(operation.root);
  copy.mockRestore();
  expect(within(dialog).getByText(formatTimestamp(operation.timestamp))).toBeInTheDocument();
  expect(
    within(dialog).getByText(formatTimestamp(operation.completion_timestamp))
  ).toBeInTheDocument();
  expect(
    within(dialog).getByRole("link", { name: "View sender address on Neo N3 explorer" })
  ).toHaveAttribute("href", `https://dora.coz.io/address/neo3/mainnet/${operation.from_address}`);
  expect(
    within(dialog).getByRole("link", { name: "View recipient address on Neo X explorer" })
  ).toHaveAttribute("href", `https://xexplorer.neo.org/address/${operation.to_address}`);
  expect(
    within(dialog).getByRole("link", { name: "View source transaction hash on Neo N3 explorer" })
  ).toHaveAttribute(
    "href",
    `https://dora.coz.io/transaction/neo3/mainnet/${operation.source_tx_hash}`
  );
  expect(
    within(dialog).getByRole("link", {
      name: "View destination transaction hash on Neo X explorer",
    })
  ).toHaveAttribute("href", `https://xexplorer.neo.org/tx/${operation.dest_tx_hash}`);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();

  await user.click(screen.getByText("0xrequest"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await user.click(screen.getByText("Pending"));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("shows missing evidence without inventing root, destination, or message metadata", async () => {
  const { user } = renderWithProviders(
    <BridgeHistoryTable
      rows={[
        row({
          ...detailOperation,
          bridge_type: "message",
          root: undefined,
          amb_message_type: "store_only",
          dest_tx_hash: undefined,
          completion_timestamp: undefined,
        }),
      ]}
      sourceChain="neo_n3"
      destinationChain="neo_x"
    />
  );
  await user.click(screen.getByRole("button", { name: "View operation 42 details" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("store only")).toBeInTheDocument();
  for (const label of [
    "Root",
    "Completion timestamp (legacy)",
    "On-chain metadata sender",
    "On-chain metadata timestamp",
    "Raw message hex",
  ]) {
    const field = within(dialog).getByText(label).parentElement;
    expect(field).toHaveTextContent("Unavailable");
  }
  const destination = within(dialog)
    .getByRole("heading", { name: /Destination ·/ })
    .closest("section")!;
  expect(within(destination).getByText("Transaction").parentElement).toHaveTextContent(
    "Unavailable"
  );
  expect(within(dialog).queryByText("0x0")).not.toBeInTheDocument();
  expect(within(dialog).queryByText(/settled|executed|distributed/i)).not.toBeInTheDocument();
});

test("shows token contracts and reverse-direction explorer links", async () => {
  const op: BackendBridgeOperation = {
    ...detailOperation,
    direction: "withdrawal",
    source_chain: "neo_x",
    destination_chain: "neo_n3",
    token_contract: "0x1234",
    dest_token_contract: "0xbbb",
    token_symbol: "NEO",
    amount: "100000000",
    claim_tx_hash: "0xclaim",
  };
  const { user } = renderWithProviders(
    <BridgeHistoryTable rows={[row(op)]} sourceChain="neo_x" destinationChain="neo_n3" />
  );
  await user.click(screen.getByRole("button", { name: "View operation 42 details" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("100000000")).toBeInTheDocument();
  expect(within(dialog).getByText("NEO")).toBeInTheDocument();
  expect(
    within(dialog).getByRole("link", { name: "View source token contract on Neo X explorer" })
  ).toHaveAttribute("href", "https://xexplorer.neo.org/address/0x1234");
  expect(
    within(dialog).getByRole("link", { name: "View destination token contract on Neo N3 explorer" })
  ).toHaveAttribute("href", `https://dora.coz.io/address/neo3/mainnet/${op.dest_token_contract}`);
  expect(
    within(dialog).getByRole("link", { name: "View claim transaction hash on Neo N3 explorer" })
  ).toHaveAttribute("href", "https://dora.coz.io/transaction/neo3/mainnet/0xclaim");
});

test("shows native operation values without token or message sections", async () => {
  const { user } = renderWithProviders(
    <BridgeHistoryTable
      rows={[row({ ...detailOperation, bridge_type: "native", amount: "42" })]}
      sourceChain="neo_n3"
      destinationChain="neo_x"
    />
  );
  await user.click(screen.getByRole("button", { name: "View operation 42 details" }));
  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByText("Amount (as reported)").parentElement).toHaveTextContent("42");
  expect(within(dialog).queryByText("Token symbol")).not.toBeInTheDocument();
  expect(within(dialog).queryByText("Raw message hex")).not.toBeInTheDocument();
});
