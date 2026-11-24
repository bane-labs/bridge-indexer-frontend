import { resolveTokenSymbol } from "./bridge-operation-utils";

import type { BackendBridgeOperation, BackendDirectionalInstanceSync } from "../types/backend-api";
import type { parseBridgeSlug } from "./bridge-slugs";

/** Normalize contract addresses for set membership checks. */
export function normalizeTokenContractAddress(addr?: string): string | null {
  if (!addr?.trim()) {
    return null;
  }
  const s = addr.trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

/** Pair identity is always N3 token followed by Neo X token. */
export function getTokenPairId(
  sourceChain: string,
  sourceToken?: string,
  destinationToken?: string
): string | undefined {
  const src = normalizeTokenContractAddress(sourceToken)?.slice(2);
  const dst = normalizeTokenContractAddress(destinationToken)?.slice(2);
  if (!src || !dst || !/^[0-9a-f]+$/.test(src) || !/^[0-9a-f]+$/.test(dst)) return undefined;
  return (sourceChain === "neo_n3" ? [src, dst] : [dst, src]).join(":");
}

/**
 * Resolve the display token ticker for a sync instance (destination-side symbol).
 */
export function resolvedSyncInstanceTokenSymbol(
  sync: BackendDirectionalInstanceSync
): string | undefined {
  if (sync.bridge_type !== "token") {
    return undefined;
  }
  return (
    sync.dst_token_symbol ??
    sync.src_token_symbol ??
    resolveTokenSymbol(sync.dst_token ?? undefined) ??
    resolveTokenSymbol(sync.src_token ?? undefined)
  );
}

/**
 * Collect normalized token contract addresses for a slug ticker using /sync/instances
 * (authoritative symbol ↔ contract mapping from the backend).
 */
export function collectTokenContractsForSymbol(
  instances: BackendDirectionalInstanceSync[],
  slugTokenSymbol: string
): Set<string> {
  const out = new Set<string>();
  const sym = slugTokenSymbol.toLowerCase();

  for (const sync of instances) {
    if (sync.bridge_type !== "token") {
      continue;
    }

    const instanceSym = resolvedSyncInstanceTokenSymbol(sync);
    if (instanceSym?.toLowerCase() !== sym) {
      continue;
    }

    for (const raw of [sync.src_token, sync.dst_token]) {
      const norm = normalizeTokenContractAddress(raw ?? undefined);
      if (norm) {
        out.add(norm);
      }
    }
  }

  return out;
}

/** Whether an operation belongs to the token bridge identified by slug ticker + contract set. */
export function operationMatchesTokenSlug(
  op: BackendBridgeOperation,
  slugTokenSymbol: string,
  contractsForSymbol: Set<string>
): boolean {
  if (op.bridge_type !== "token") {
    return true;
  }

  const sym = slugTokenSymbol.toLowerCase();

  if (op.token_symbol?.trim() && op.token_symbol.trim().toLowerCase() === sym) {
    return true;
  }

  if (contractsForSymbol.size > 0) {
    const src = normalizeTokenContractAddress(op.token_contract);
    const dst = normalizeTokenContractAddress(op.dest_token_contract);
    return (
      (src !== null && contractsForSymbol.has(src)) || (dst !== null && contractsForSymbol.has(dst))
    );
  }

  const resolved =
    resolveTokenSymbol(op.dest_token_contract) ?? resolveTokenSymbol(op.token_contract);
  return resolved?.toLowerCase() === sym;
}

/** Select the same bridge identity for client and server history loaders. */
export function selectBridgeData(
  parsed: NonNullable<ReturnType<typeof parseBridgeSlug>>,
  operations: BackendBridgeOperation[],
  syncInstances: BackendDirectionalInstanceSync[]
) {
  const contractsForTokenSymbol =
    parsed.bridgeFamily === "token" && parsed.tokenSymbol
      ? collectTokenContractsForSymbol(syncInstances, parsed.tokenSymbol)
      : new Set<string>();

  const selectedInstances = syncInstances.filter((instance) => {
    if (instance.bridge_type !== parsed.bridgeFamily) return false;
    if (parsed.bridgeFamily !== "token") return true;
    if (parsed.tokenPairId) {
      return (
        getTokenPairId(instance.src_chain, instance.src_token, instance.dst_token) ===
        parsed.tokenPairId
      );
    }
    if (parsed.instanceId) return instance.id === parsed.instanceId;
    return (
      resolvedSyncInstanceTokenSymbol(instance)?.toLowerCase() === parsed.tokenSymbol?.toLowerCase()
    );
  });
  const selectedOperations = operations.filter((op) => {
    if (op.bridge_type !== parsed.bridgeFamily) return false;
    if (parsed.bridgeFamily !== "token") return true;
    if (parsed.tokenPairId) {
      return (
        getTokenPairId(op.source_chain, op.token_contract, op.dest_token_contract) ===
        parsed.tokenPairId
      );
    }
    if (parsed.instanceId) {
      return selectedInstances.some(
        (instance) =>
          instance.src_chain === op.source_chain &&
          instance.dst_chain === op.destination_chain &&
          normalizeTokenContractAddress(instance.src_token) ===
            normalizeTokenContractAddress(op.token_contract) &&
          normalizeTokenContractAddress(instance.dst_token) ===
            normalizeTokenContractAddress(op.dest_token_contract)
      );
    }
    return Boolean(
      parsed.tokenSymbol &&
        operationMatchesTokenSlug(op, parsed.tokenSymbol, contractsForTokenSymbol)
    );
  });
  const pairs = new Set(
    selectedInstances.map(
      (instance) =>
        getTokenPairId(instance.src_chain, instance.src_token, instance.dst_token) ?? instance.id
    )
  );
  return {
    instances: selectedInstances,
    operations: selectedOperations,
    tokenSymbol:
      parsed.tokenSymbol ?? selectedInstances.map(resolvedSyncInstanceTokenSymbol).find(Boolean),
    combined: Boolean(parsed.tokenSymbol && pairs.size > 1),
  };
}
