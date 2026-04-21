import type { DirectionalBridgeStatus } from "../types/bridge";

/**
 * Mock bridge statuses for the state inspection view.
 *
 * Covers diverse scenarios:
 * - native bridge: one synced, one out-of-sync direction
 * - message bridge: both synced
 * - multiple token bridges with mixed states
 * - stale cards
 * - nonce mismatch only
 * - root mismatch only
 * - nonce and root mismatch
 * - fully matched pairs
 */
export const MOCK_BRIDGE_STATE_STATUSES: DirectionalBridgeStatus[] = [
  // ─── Native Bridge ──────────────────────────────────────
  // N3→X: synced
  {
    id: "native-n3-to-x",
    bridgeFamily: "native",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 14_832,
      root: "0xa3f1c9e7d4b82056fa9301ee2c4d8b76a1f3e5d9",
      blockNumber: 8_421_093,
      updatedAt: "2026-03-12T10:32:10Z",
    },
    destination: {
      nonce: 14_832,
      root: "0xa3f1c9e7d4b82056fa9301ee2c4d8b76a1f3e5d9",
      blockNumber: 2_104_887,
      updatedAt: "2026-03-12T10:32:15Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:32:15Z",
  },
  // X→N3: out of sync — nonce mismatch only
  {
    id: "native-x-to-n3",
    bridgeFamily: "native",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 11_210,
      root: "0xb7e4a2d6c93f10584e8b2a61d0c7f39e5b4a81d2",
      blockNumber: 2_104_895,
      updatedAt: "2026-03-12T10:31:58Z",
    },
    destination: {
      nonce: 11_205,
      root: "0xb7e4a2d6c93f10584e8b2a61d0c7f39e5b4a81d2",
      blockNumber: 8_421_090,
      updatedAt: "2026-03-12T10:32:02Z",
    },
    operationStatus: "delayed",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:32:02Z",
  },

  // ─── Message Bridge ─────────────────────────────────────
  // Both directions synced
  {
    id: "message-n3-to-x",
    bridgeFamily: "message",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 6_419,
      root: "0xd2c8e1f47a5b930861e4d7c2a0f6b83e197d5c4a",
      blockNumber: 8_421_091,
      updatedAt: "2026-03-12T10:30:44Z",
    },
    destination: {
      nonce: 6_419,
      root: "0xd2c8e1f47a5b930861e4d7c2a0f6b83e197d5c4a",
      blockNumber: 2_104_882,
      updatedAt: "2026-03-12T10:30:50Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:30:50Z",
  },
  {
    id: "message-x-to-n3",
    bridgeFamily: "message",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 5_887,
      root: "0xe5f9a1b3c7d208463b1e0d4f6a8c25e3d7b9f0a1",
      blockNumber: 2_104_878,
      updatedAt: "2026-03-12T10:29:32Z",
    },
    destination: {
      nonce: 5_887,
      root: "0xe5f9a1b3c7d208463b1e0d4f6a8c25e3d7b9f0a1",
      blockNumber: 8_421_088,
      updatedAt: "2026-03-12T10:29:40Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:29:40Z",
  },

  // ─── Token Bridge: NEO ──────────────────────────────────
  // Both directions synced
  {
    id: "token-neo-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "NEO",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 3_210,
      root: "0xf4a7b38c1d6e0952a4c8d3f2b0e71a9c5d836f4e",
      blockNumber: 8_421_092,
      updatedAt: "2026-03-12T10:31:20Z",
    },
    destination: {
      nonce: 3_210,
      root: "0xf4a7b38c1d6e0952a4c8d3f2b0e71a9c5d836f4e",
      blockNumber: 2_104_885,
      updatedAt: "2026-03-12T10:31:28Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:31:28Z",
  },
  {
    id: "token-neo-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "NEO",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 2_987,
      root: "0xa1c3d5e7f90b2d4e6a8c0f2e4d6b8a1c3e5f7d9b",
      blockNumber: 2_104_883,
      updatedAt: "2026-03-12T10:31:05Z",
    },
    destination: {
      nonce: 2_987,
      root: "0xa1c3d5e7f90b2d4e6a8c0f2e4d6b8a1c3e5f7d9b",
      blockNumber: 8_421_089,
      updatedAt: "2026-03-12T10:31:12Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:31:12Z",
  },

  // ─── Token Bridge: GAS ──────────────────────────────────
  // N3→X: out of sync — nonce AND root mismatch
  {
    id: "token-gas-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "GAS",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 8_741,
      root: "0xc2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f0a2b4c6d8",
      blockNumber: 8_421_090,
      updatedAt: "2026-03-12T10:28:55Z",
    },
    destination: {
      nonce: 8_736,
      root: "0xb1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f2a4b6c8",
      blockNumber: 2_104_879,
      updatedAt: "2026-03-12T10:28:48Z",
    },
    operationStatus: "delayed",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:28:55Z",
  },
  // X→N3: synced
  {
    id: "token-gas-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "GAS",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 7_553,
      root: "0xd3e5f7a9b1c3d5e7f9a0b2c4d6e8f1a3b5c7d9e0",
      blockNumber: 2_104_877,
      updatedAt: "2026-03-12T10:27:30Z",
    },
    destination: {
      nonce: 7_553,
      root: "0xd3e5f7a9b1c3d5e7f9a0b2c4d6e8f1a3b5c7d9e0",
      blockNumber: 8_421_086,
      updatedAt: "2026-03-12T10:27:38Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:27:38Z",
  },

  // ─── Token Bridge: bNEO ─────────────────────────────────
  // N3→X: stale with nonce mismatch
  {
    id: "token-bneo-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "bNEO",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 1_456,
      root: "0xe4f6a8b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2",
      blockNumber: 8_421_085,
      updatedAt: "2026-03-12T09:10:00Z",
    },
    destination: {
      nonce: 1_448,
      root: "0xd5e7f9a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e2",
      blockNumber: 2_104_870,
      updatedAt: "2026-03-12T09:08:22Z",
    },
    operationStatus: "delayed",
    indexerStatus: "lagging",
    lastUpdatedAt: "2026-03-12T09:10:00Z",
  },
  // X→N3: syncing (nonce diff = 1)
  {
    id: "token-bneo-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "bNEO",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 1_102,
      root: "0xf5a7b9c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2",
      blockNumber: 2_104_868,
      updatedAt: "2026-03-12T10:25:10Z",
    },
    destination: {
      nonce: 1_101,
      root: "0xe6f8a0b2c4d6e8f0a1b3c5d7e9f2a4b6c8d0e1f3",
      blockNumber: 8_421_083,
      updatedAt: "2026-03-12T10:25:18Z",
    },
    operationStatus: "pending",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:25:18Z",
  },

  // ─── Token Bridge: fUSDT ────────────────────────────────
  // Both synced
  {
    id: "token-fusdt-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "fUSDT",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 22_019,
      root: "0xa6b8c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3",
      blockNumber: 8_421_093,
      updatedAt: "2026-03-12T10:32:05Z",
    },
    destination: {
      nonce: 22_019,
      root: "0xa6b8c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3",
      blockNumber: 2_104_886,
      updatedAt: "2026-03-12T10:32:12Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:32:12Z",
  },
  {
    id: "token-fusdt-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "fUSDT",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 19_844,
      root: "0xb7c9d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b2c4",
      blockNumber: 2_104_884,
      updatedAt: "2026-03-12T10:31:50Z",
    },
    destination: {
      nonce: 19_844,
      root: "0xb7c9d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b2c4",
      blockNumber: 8_421_091,
      updatedAt: "2026-03-12T10:31:55Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:31:55Z",
  },

  // ─── Token Bridge: FLM ─────────────────────────────────
  // N3→X: root mismatch only (same nonce, different root)
  {
    id: "token-flm-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "FLM",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 4_502,
      root: "0xaa11bb22cc33dd44ee55ff66aa77bb88cc99dd00",
      blockNumber: 8_421_094,
      updatedAt: "2026-03-12T10:33:10Z",
    },
    destination: {
      nonce: 4_502,
      root: "0xff00ee11dd22cc33bb44aa55996688770055443322",
      blockNumber: 2_104_888,
      updatedAt: "2026-03-12T10:33:15Z",
    },
    operationStatus: "delayed",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:33:15Z",
  },
  // X→N3: synced
  {
    id: "token-flm-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "FLM",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 3_901,
      root: "0x1122334455667788990011223344556677889900",
      blockNumber: 2_104_889,
      updatedAt: "2026-03-12T10:33:05Z",
    },
    destination: {
      nonce: 3_901,
      root: "0x1122334455667788990011223344556677889900",
      blockNumber: 8_421_095,
      updatedAt: "2026-03-12T10:33:08Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:33:08Z",
  },

  // ─── Token Bridge: SWTH ─────────────────────────────────
  // N3→X: stale — both sides old
  {
    id: "token-swth-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "SWTH",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 892,
      root: "0xaabbccddee1122334455aabbccddee1122334455",
      blockNumber: 8_420_010,
      updatedAt: "2026-03-11T22:15:00Z",
    },
    destination: {
      nonce: 892,
      root: "0xaabbccddee1122334455aabbccddee1122334455",
      blockNumber: 2_103_810,
      updatedAt: "2026-03-11T22:15:05Z",
    },
    operationStatus: "synced",
    indexerStatus: "lagging",
    lastUpdatedAt: "2026-03-11T22:15:05Z",
  },
  // X→N3: stale — both sides old
  {
    id: "token-swth-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "SWTH",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 645,
      root: "0x55443322110099887766554433221100ffeeddcc",
      blockNumber: 2_103_808,
      updatedAt: "2026-03-11T22:10:30Z",
    },
    destination: {
      nonce: 640,
      root: "0x44332211009988776655443322110099eeddccbb",
      blockNumber: 8_420_008,
      updatedAt: "2026-03-11T22:10:35Z",
    },
    operationStatus: "delayed",
    indexerStatus: "lagging",
    lastUpdatedAt: "2026-03-11T22:10:35Z",
  },

  // ─── Token Bridge: NUDES ────────────────────────────────
  // Both synced (exotic token)
  {
    id: "token-nudes-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "NUDES",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 156,
      root: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      blockNumber: 8_421_080,
      updatedAt: "2026-03-12T10:20:00Z",
    },
    destination: {
      nonce: 156,
      root: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
      blockNumber: 2_104_860,
      updatedAt: "2026-03-12T10:20:05Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:20:05Z",
  },
  {
    id: "token-nudes-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "NUDES",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 98,
      root: "0x9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a",
      blockNumber: 2_104_858,
      updatedAt: "2026-03-12T10:19:55Z",
    },
    destination: {
      nonce: 98,
      root: "0x9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a",
      blockNumber: 8_421_078,
      updatedAt: "2026-03-12T10:20:00Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:20:00Z",
  },

  // ─── Token Bridge: GM ───────────────────────────────────
  // N3→X: unknown status
  {
    id: "token-gm-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "GM",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 42,
      root: "0x00000000000000000000000000000000000000000000",
      blockNumber: 8_421_050,
      updatedAt: "2026-03-12T10:15:00Z",
    },
    destination: {
      nonce: 0,
      root: "0x00000000000000000000000000000000000000000000",
      blockNumber: 2_104_830,
      updatedAt: "2026-03-12T10:15:05Z",
    },
    operationStatus: "delayed",
    indexerStatus: "unknown",
    lastUpdatedAt: "2026-03-12T10:15:05Z",
  },
  // X→N3: synced
  {
    id: "token-gm-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "GM",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 15,
      root: "0xdeadbeef00112233445566778899aabbccddeeff",
      blockNumber: 2_104_828,
      updatedAt: "2026-03-12T10:14:50Z",
    },
    destination: {
      nonce: 15,
      root: "0xdeadbeef00112233445566778899aabbccddeeff",
      blockNumber: 8_421_048,
      updatedAt: "2026-03-12T10:14:55Z",
    },
    operationStatus: "synced",
    indexerStatus: "fresh",
    lastUpdatedAt: "2026-03-12T10:14:55Z",
  },
];
