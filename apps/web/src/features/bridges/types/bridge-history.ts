import type { ChainId } from "./bridge";

/** A single bridge operation in the history view. */
export interface BridgeOperation {
  nonce: number;
  root: string;
  sourceTx?: string;
  destinationTx?: string;
  settledAt?: string;
}

/** History for one direction of a bridge. */
export interface DirectionalBridgeHistory {
  sourceChain: ChainId;
  destinationChain: ChainId;
  operations: BridgeOperation[];
}

/** Complete history data for a bridge (both directions). */
export interface BridgeHistoryData {
  slug: string;
  label: string;
  directions: [DirectionalBridgeHistory, DirectionalBridgeHistory];
}
