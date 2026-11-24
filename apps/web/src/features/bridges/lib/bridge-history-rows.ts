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
      };

      if (op.status === "stuck") {
        if (op.claim_tx_hash) {
          // Relayed and subsequently claimed — show as completed with claim
          // tx link in the Settlement column.
          return {
            ...base,
            status: "completed" as const,
            claimTxHash: op.claim_tx_hash,
            settledAt: op.completion_timestamp,
          };
        }
        // Relayed, waiting for the user to claim (native/token) or the
        // message to be executed (message bridge).
        return {
          ...base,
          status: "relayed" as const,
          settlementStatus:
            op.bridge_type === "message"
              ? ("waiting_for_execution" as const)
              : ("waiting_to_be_claimed" as const),
        };
      }

      if (op.status === "pending") {
        // Not yet indexed on the destination chain — no settlement action yet.
        return {
          ...base,
          status: "pending" as const,
        };
      }

      // completed — directly distributed, no separate claim step.
      return {
        ...base,
        status: "completed" as const,
        settledAt: op.completion_timestamp,
      };
    });
}
