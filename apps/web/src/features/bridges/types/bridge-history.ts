import type { BridgeFamily, ChainId } from "./bridge";

/** A single bridge operation row in the history view. */
export interface BridgeOperationHistoryRow {
  id: string;
  nonce: number;
  root: string;
  sourceTxHash?: string;
  destinationTxHash?: string;
  settledAt?: string;
}

/** History for one direction of a bridge. */
export interface BridgeDirectionHistory {
  sourceChain: ChainId;
  destinationChain: ChainId;
  rows: BridgeOperationHistoryRow[];
}

/** Complete history data for a bridge page (both directions). */
export interface BridgeHistoryPageData {
  slug: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  label: string;
  directions: [BridgeDirectionHistory, BridgeDirectionHistory];
}
