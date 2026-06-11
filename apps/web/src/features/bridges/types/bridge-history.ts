import type { BridgeFamily, ChainId } from "./bridge";

/** A single bridge operation row in the history view. */
export interface BridgeOperationHistoryRow {
  id: string;
  nonce: number;
  root: string;
  sourceTxHash?: string;
  /**
   * Transaction where the relayer updated the root on the destination chain.
   * Populated once the operation has been relayed.
   */
  destinationTxHash?: string;
  settledAt?: string;
  /**
   * Front-end operation status, mapped from the backend status:
   * - "pending": operation is in transit, not yet visible on the destination.
   * - "relayed": root has been posted to the destination; awaiting claim or
   *   execution (was a backend `stuck` or in-relay `pending` operation).
   * - "completed": fully settled — either directly distributed or after a
   *   relay-then-claim flow.
   */
  status: "pending" | "relayed" | "completed";
  /**
   * Settlement disposition for operations in the relay-then-claim /
   * relay-then-execute flow:
   * - "waiting_to_be_claimed": relayed, user has not yet claimed (native/token).
   * - "waiting_for_execution": relayed message not yet executed (message bridge).
   * - undefined: directly completed with no separate settlement step.
   */
  settlementStatus?: "waiting_to_be_claimed" | "waiting_for_execution";
  /**
   * Claim transaction hash, present when an operation was relayed and then
   * explicitly claimed by the user. Rendered as a link in the Settlement column.
   */
  claimTxHash?: string;
  /** Transfer amount (string for big number safety). */
  amount?: string;
  /** Sender address on source chain. */
  fromAddress?: string;
  /** Recipient address on destination chain. */
  toAddress?: string;
}

/** History for one direction of a bridge. */
export interface BridgeDirectionHistory {
  sourceChain: ChainId;
  destinationChain: ChainId;
  rows: BridgeOperationHistoryRow[];
}

/** Complete history data for a bridge direction page (one direction). */
export interface BridgeHistoryPageData {
  slug: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  label: string;
  directions: [BridgeDirectionHistory];
}
