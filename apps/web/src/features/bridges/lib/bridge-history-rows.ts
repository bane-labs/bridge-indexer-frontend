import type { BackendBridgeOperation } from "../types/backend-api";
import type { BridgeOperationHistoryRow } from "../types/bridge-history";

export function buildRows(
  operations: BackendBridgeOperation[],
  direction: "deposit" | "withdrawal"
): BridgeOperationHistoryRow[] {
  return operations
    .filter((op) => op.direction === direction)
    .sort((a, b) => b.nonce - a.nonce)
    .map((op) => {
      const base = {
        id: [op.bridge_type, direction, op.token_contract, op.dest_token_contract, op.nonce].join(
          ":"
        ),
        operation: op,
        nonce: op.nonce,
        root: op.root,
        sourceTxHash: op.source_tx_hash,
        destinationTxHash: op.dest_tx_hash,
        amount: op.amount,
        fromAddress: op.from_address,
        toAddress: op.to_address,
        // Preserve the backend's legacy status without deriving relay or execution.
        status: op.status,
        claimTxHash: op.claim_tx_hash,
        completionTimestamp: op.completion_timestamp,
      };
      return base;
    });
}
