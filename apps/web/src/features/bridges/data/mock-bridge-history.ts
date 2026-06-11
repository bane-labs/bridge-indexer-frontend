import type { BridgeHistoryPageData } from "../types/bridge-history";

// ─────────────────────────────────────────────────────────
// Helper: generate deterministic mock tx hashes
// ─────────────────────────────────────────────────────────

function mockTxHash(seed: string, index: number): string {
  const base = seed.padEnd(60, "0").slice(0, 60);
  const suffix = index.toString(16).padStart(4, "0");
  return `0x${base}${suffix}`;
}

function mockRoot(seed: string, index: number): string {
  const base = seed.padEnd(36, "f").slice(0, 36);
  const suffix = index.toString(16).padStart(4, "0");
  return `0x${base}${suffix}`;
}

function settledTime(baseIso: string, offsetMinutes: number): string {
  const d = new Date(baseIso);
  d.setMinutes(d.getMinutes() - offsetMinutes);
  return d.toISOString();
}

// ─────────────────────────────────────────────────────────
// Native Bridge → 10 rows per direction
// ─────────────────────────────────────────────────────────

const NATIVE_HISTORY: BridgeHistoryPageData = {
  slug: "native",
  bridgeFamily: "native",
  label: "Native Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 10 }, (_, i) => {
        const base = {
          id: `native-n3x-${i}`,
          nonce: 14_832 - i,
          root: mockRoot("a3f1c9e7d4b82056fa9301ee", i),
          sourceTxHash: mockTxHash("9a1b2c3d4e5f60718293a4b5c6d7e8f9", i),
        };
        // i=0..6: directly completed
        if (i < 7) {
          return {
            ...base,
            status: "completed" as const,
            destinationTxHash: mockTxHash("f0e1d2c3b4a596870a1b2c3d", i),
            settledAt: settledTime("2026-03-10T14:32:15Z", i * 4),
          };
        }
        // i=7: relay-then-claim, already claimed → Completed + claim tx in Settlement
        if (i === 7) {
          return {
            ...base,
            status: "completed" as const,
            destinationTxHash: mockTxHash("f0e1d2c3b4a596870a1b2c3d", i),
            claimTxHash: mockTxHash("aa11bb22cc33dd44ee55ff66", i),
            settledAt: settledTime("2026-03-10T14:32:15Z", i * 4),
          };
        }
        // i=8: relayed, root posted to dst, waiting for claim → Relayed + Settlement "Waiting to be claimed"
        if (i === 8) {
          return {
            ...base,
            status: "relayed" as const,
            destinationTxHash: mockTxHash("f0e1d2c3b4a596870a1b2c3d", i),
            settlementStatus: "waiting_to_be_claimed" as const,
          };
        }
        // i=9: pending, not yet relayed
        return {
          ...base,
          status: "pending" as const,
          settlementStatus: "waiting_to_be_claimed" as const,
        };
      }),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: `native-xn3-${i}`,
        nonce: 11_205 - i,
        status: i < 9 ? ("completed" as const) : ("pending" as const),
        root: mockRoot("b7e4a2d6c93f10584e8b2a61", i),
        sourceTxHash: mockTxHash("5566778899001122334455aa", i),
        destinationTxHash: i < 9 ? mockTxHash("eeff001122334455aabbccdd", i) : undefined,
        settledAt: i < 9 ? settledTime("2026-03-10T14:32:02Z", i * 3) : undefined,
        ...(i === 9 ? { settlementStatus: "waiting_to_be_claimed" as const } : {}),
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// Message Bridge → 12 rows per direction
// ─────────────────────────────────────────────────────────

const MESSAGE_HISTORY: BridgeHistoryPageData = {
  slug: "message",
  bridgeFamily: "message",
  label: "Message Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 12 }, (_, i) => ({
        id: `msg-n3x-${i}`,
        nonce: 6_419 - i,
        status: i < 10 ? "completed" : "pending",
        root: mockRoot("d2c8e1f47a5b930861e4d7c2", i),
        sourceTxHash: mockTxHash("8899001122334455667788bb", i),
        destinationTxHash: i < 10 ? mockTxHash("001122aabbccddeeff0011cc", i) : undefined,
        settledAt: i < 10 ? settledTime("2026-03-10T14:30:50Z", i * 5) : undefined,
      })),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 12 }, (_, i) => ({
        id: `msg-xn3-${i}`,
        nonce: 5_312 - i,
        status: i < 11 ? "completed" : "pending",
        root: mockRoot("e3d9f2a58b6c041972f5e8d3", i),
        sourceTxHash: mockTxHash("aa00112233445566778899dd", i),
        destinationTxHash: i < 11 ? mockTxHash("112233aabbccddeeff0011ee", i) : undefined,
        settledAt: i < 11 ? settledTime("2026-03-10T14:29:40Z", i * 4) : undefined,
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// NEO Token Bridge → 12 rows per direction
// ─────────────────────────────────────────────────────────

const TOKEN_NEO_HISTORY: BridgeHistoryPageData = {
  slug: "token-neo",
  bridgeFamily: "token",
  tokenSymbol: "NEO",
  label: "NEO Token Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 12 }, (_, i) => ({
        id: `neo-n3x-${i}`,
        nonce: 3_241 - i,
        status: i < 10 ? "completed" : "pending",
        root: mockRoot("f4ea93b69c7d152a83a6f9e4", i),
        sourceTxHash: mockTxHash("bb11223344556677889900ff", i),
        destinationTxHash: i < 10 ? mockTxHash("223344aabbccddeeff001122", i) : undefined,
        settledAt: i < 10 ? settledTime("2026-03-10T14:31:22Z", i * 3) : undefined,
      })),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 12 }, (_, i) => ({
        id: `neo-xn3-${i}`,
        nonce: 2_819 - i,
        status: i < 11 ? "completed" : "pending",
        root: mockRoot("c1b9d0e36b4a820750d3c6b1", i),
        sourceTxHash: mockTxHash("ee44556677889900112233aa", i),
        destinationTxHash: i < 11 ? mockTxHash("445566aabbccddeeff001144", i) : undefined,
        settledAt: i < 11 ? settledTime("2026-03-10T14:30:05Z", i * 4) : undefined,
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// GAS Token Bridge → 10 rows per direction
// ─────────────────────────────────────────────────────────

const TOKEN_GAS_HISTORY: BridgeHistoryPageData = {
  slug: "token-gas",
  bridgeFamily: "token",
  tokenSymbol: "GAS",
  label: "GAS Token Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: `gas-n3x-${i}`,
        nonce: 8_102 - i,
        status: i < 8 ? "completed" : "pending",
        root: mockRoot("a1b2c3d4e5f6a7b8c9d0e1f2", i),
        sourceTxHash: mockTxHash("aa11bb22cc33dd44ee55ff66", i),
        destinationTxHash: i < 8 ? mockTxHash("667788aabbccddeeff001166", i) : undefined,
        settledAt: i < 8 ? settledTime("2026-03-10T14:31:55Z", i * 5) : undefined,
      })),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 10 }, (_, i) => ({
        id: `gas-xn3-${i}`,
        nonce: 7_450 - i,
        status: i < 9 ? "completed" : "pending",
        root: mockRoot("c3d4e5f6a7b8c9d0e1f2a3b4", i),
        sourceTxHash: mockTxHash("cc33dd44ee55ff66aa11bb22", i),
        destinationTxHash: i < 9 ? mockTxHash("889900aabbccddeeff001188", i) : undefined,
        settledAt: i < 9 ? settledTime("2026-03-10T14:30:20Z", i * 4) : undefined,
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// bNEO Token Bridge → 15 rows per direction (large)
// ─────────────────────────────────────────────────────────

const TOKEN_BNEO_HISTORY: BridgeHistoryPageData = {
  slug: "token-bneo",
  bridgeFamily: "token",
  tokenSymbol: "bNEO",
  label: "bNEO Token Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 15 }, (_, i) => ({
        id: `bneo-n3x-${i}`,
        nonce: 1_823 - i,
        status: i < 13 ? "completed" : "pending",
        root: mockRoot("d5e6f7a8b9c0d1e2f3a4b5c6", i),
        sourceTxHash: mockTxHash("1122334455667788990011ab", i),
        destinationTxHash: i < 13 ? mockTxHash("aabb112233445566778899cd", i) : undefined,
        settledAt: i < 13 ? settledTime("2026-03-10T14:28:40Z", i * 3) : undefined,
      })),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 15 }, (_, i) => ({
        id: `bneo-xn3-${i}`,
        nonce: 1_501 - i,
        status: i < 12 ? "completed" : "pending",
        root: mockRoot("e6f7a8b9c0d1e2f3a4b5c6d7", i),
        sourceTxHash: mockTxHash("2233445566778899001122cd", i),
        destinationTxHash: i < 12 ? mockTxHash("bbcc223344556677889900ef", i) : undefined,
        settledAt: i < 12 ? settledTime("2026-03-10T14:27:10Z", i * 4) : undefined,
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// fUSDT Token Bridge → 8 rows per direction (smaller)
// ─────────────────────────────────────────────────────────

const TOKEN_FUSDT_HISTORY: BridgeHistoryPageData = {
  slug: "token-fusdt",
  bridgeFamily: "token",
  tokenSymbol: "fUSDT",
  label: "fUSDT Token Bridge",
  directions: [
    {
      sourceChain: "neo_n3",
      destinationChain: "neo_x",
      rows: Array.from({ length: 8 }, (_, i) => ({
        id: `fusdt-n3x-${i}`,
        nonce: 421 - i,
        status: i < 6 ? "completed" : "pending",
        root: mockRoot("f7a8b9c0d1e2f3a4b5c6d7e8", i),
        sourceTxHash: mockTxHash("3344556677889900112233ef", i),
        destinationTxHash: i < 6 ? mockTxHash("ccdd33445566778899001100", i) : undefined,
        settledAt: i < 6 ? settledTime("2026-03-10T14:25:30Z", i * 6) : undefined,
      })),
    },
    {
      sourceChain: "neo_x",
      destinationChain: "neo_n3",
      rows: Array.from({ length: 8 }, (_, i) => ({
        id: `fusdt-xn3-${i}`,
        nonce: 389 - i,
        status: i < 7 ? "completed" : "pending",
        root: mockRoot("a8b9c0d1e2f3a4b5c6d7e8f9", i),
        sourceTxHash: mockTxHash("4455667788990011223344ab", i),
        destinationTxHash: i < 7 ? mockTxHash("ddee445566778899001122ff", i) : undefined,
        settledAt: i < 7 ? settledTime("2026-03-10T14:24:00Z", i * 5) : undefined,
      })),
    },
  ],
};

// ─────────────────────────────────────────────────────────
// Registry: slug → page data
// ─────────────────────────────────────────────────────────

export const MOCK_BRIDGE_HISTORY: Record<string, BridgeHistoryPageData> = {
  native: NATIVE_HISTORY,
  message: MESSAGE_HISTORY,
  "token-neo": TOKEN_NEO_HISTORY,
  "token-gas": TOKEN_GAS_HISTORY,
  "token-bneo": TOKEN_BNEO_HISTORY,
  "token-fusdt": TOKEN_FUSDT_HISTORY,
};
