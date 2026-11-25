import type { BackendBridgeOperation, BackendOperationStatus } from "./backend-api";
import type { BridgeFamily, ChainId } from "./bridge";

/** A single bridge operation row in the history view. */
export interface BridgeOperationHistoryRow {
  id: string;
  /** The backend record for technical details; lifecycle presentation is mapped in buildRows. */
  operation: BackendBridgeOperation;
  nonce: number;
  root?: string;
  sourceTxHash?: string;
  /** Destination transaction reported by the backend, when available. */
  destinationTxHash?: string;
  /** Uninterpreted legacy backend operation status. */
  status: BackendOperationStatus;
  /** Claim transaction hash, if separately reported by the backend. */
  claimTxHash?: string;
  /** Legacy completion timestamp; not necessarily destination settlement. */
  completionTimestamp?: string;
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
  tokenPairId?: string;
  directions: [BridgeDirectionHistory];
}
