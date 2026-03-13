import type { BridgeHistoryData } from "../types/bridge-history";

/**
 * Mock bridge history data keyed by slug.
 *
 * Slugs match the format from `getBridgeSlug()`:
 *  - "native" | "message" | "token-{symbol}"
 */
export const MOCK_BRIDGE_HISTORY: Record<string, BridgeHistoryData> = {
  native: {
    slug: "native",
    label: "Native Bridge",
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        operations: [
          {
            nonce: 14_832,
            root: "0xa3f1c9e7d4b82056fa9301ee2c4d8b76a1f3e5d9",
            sourceTx: "0x9a1b2c3d4e5f6071829a3b4c5d6e7f80a1b2c3d4e5f6071829a3b4c5d6e7f80",
            destinationTx: "0xf0e1d2c3b4a59687f0e1d2c3b4a59687f0e1d2c3b4a59687f0e1d2c3b4a59687",
            settledAt: "2026-03-10T14:32:15Z",
          },
          {
            nonce: 14_831,
            root: "0xb2e0d8f56c3a71940eb8301df1c5a967b0e2f4c8",
            sourceTx: "0x1122334455667788990011223344556677889900112233445566778899001122",
            destinationTx: "0xaabbccddeeff00112233aabbccddeeff00112233aabbccddeeff00112233aabb",
            settledAt: "2026-03-10T14:28:42Z",
          },
          {
            nonce: 14_830,
            root: "0xc3d1e9a67b4c82051fa9402ee3d5b876c2f4e6da",
            sourceTx: "0x2233445566778899001122334455667788990011223344556677889900112233",
            destinationTx: "0xbbccddeeff00112233aabbccddeeff00112233aabbccddeeff00112233aabbcc",
            settledAt: "2026-03-10T14:25:10Z",
          },
          {
            nonce: 14_829,
            root: "0xd4e2fab78c5d93162gb0513ff4e6c987d3g5f7eb",
            sourceTx: "0x3344556677889900112233445566778899001122334455667788990011223344",
            settledAt: "2026-03-10T14:20:55Z",
          },
          {
            nonce: 14_828,
            root: "0xe5f3gbc89d6ea4273hc1624gg5f7da98e4h6g8fc",
            sourceTx: "0x4455667788990011223344556677889900112233445566778899001122334455",
            destinationTx: "0xddeeff00112233aabbccddeeff00112233aabbccddeeff00112233aabbccddee",
            settledAt: "2026-03-10T14:16:30Z",
          },
        ],
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        operations: [
          {
            nonce: 11_205,
            root: "0xb7e4a2d6c93f10584e8b2a61d0c7f39e5b4a81d2",
            sourceTx: "0x5566778899001122334455667788990011223344556677889900112233445566",
            destinationTx: "0xeeff00112233aabbccddeeff00112233aabbccddeeff00112233aabbccddeeff",
            settledAt: "2026-03-10T14:32:02Z",
          },
          {
            nonce: 11_204,
            root: "0xa6d3b1c5b82e0f473d7a1950c9b6e28d4a3970c1",
            sourceTx: "0x6677889900112233445566778899001122334455667788990011223344556677",
            destinationTx: "0xff00112233aabbccddeeff00112233aabbccddeeff00112233aabbccddeeff00",
            settledAt: "2026-03-10T14:28:10Z",
          },
          {
            nonce: 11_203,
            root: "0x95c2a0b4a71d0e362c690840b8a5d17c393869b0",
            sourceTx: "0x7788990011223344556677889900112233445566778899001122334455667788",
            settledAt: "2026-03-10T14:24:33Z",
          },
        ],
      },
    ],
  },

  message: {
    slug: "message",
    label: "Message Bridge",
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        operations: [
          {
            nonce: 6_419,
            root: "0xd2c8e1f47a5b930861e4d7c2a0f6b83e197d5c4a",
            sourceTx: "0x8899001122334455667788990011223344556677889900112233445566778899",
            settledAt: "2026-03-10T14:30:50Z",
          },
          {
            nonce: 6_418,
            root: "0xc1a9d0e36b4a820750d3c6b1f9e5a72d086c4b39",
            sourceTx: "0x9900112233445566778899001122334455667788990011223344556677889900",
            destinationTx: "0x00112233aabbccddeeff00112233aabbccddeeff00112233aabbccddeeff0011",
            settledAt: "2026-03-10T14:27:15Z",
          },
        ],
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        operations: [
          {
            nonce: 5_312,
            root: "0xe3d9f2g58b6c041972f5e8d3b1g7c94f2a8e6d5b",
            sourceTx: "0xaa00112233445566778899aa00112233445566778899aa001122334455667788",
            destinationTx: "0x112233aabbccddeeff00112233aabbccddeeff00112233aabbccddeeff001122",
            settledAt: "2026-03-10T14:29:40Z",
          },
        ],
      },
    ],
  },

  "token-neo": {
    slug: "token-neo",
    label: "NEO Token Bridge",
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        operations: [
          {
            nonce: 3_241,
            root: "0xf4eag3h69c7d152a83g6f9e4c2h8da5g3b9f7e6c",
            sourceTx: "0xbb11223344556677889900bb11223344556677889900bb112233445566778899",
            destinationTx: "0x2233aabbccddeeff00112233aabbccddeeff00112233aabbccddeeff00112233",
            settledAt: "2026-03-10T14:31:22Z",
          },
          {
            nonce: 3_240,
            root: "0xe3dfb2g58a6c041972f5e8d3b1g7c94f2a8e6d5b",
            sourceTx: "0xcc22334455667788990011cc22334455667788990011cc2233445566778899cc",
            destinationTx: "0x3344aabbccddeeff00113344aabbccddeeff00113344aabbccddeeff00113344",
            settledAt: "2026-03-10T14:26:45Z",
          },
          {
            nonce: 3_239,
            root: "0xd2cea1f47a5b930861e4d7c2a0f6b83e197d5c4a",
            sourceTx: "0xdd33445566778899001122dd33445566778899001122dd334455667788990011",
            settledAt: "2026-03-10T14:22:18Z",
          },
        ],
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        operations: [
          {
            nonce: 2_819,
            root: "0xc1b9d0e36b4a820750d3c6b1f9e5a72d086c4b39",
            sourceTx: "0xee44556677889900112233ee44556677889900112233ee4455667788990011ee",
            destinationTx: "0x4455aabbccddeeff00114455aabbccddeeff00114455aabbccddeeff00114455",
            settledAt: "2026-03-10T14:30:05Z",
          },
          {
            nonce: 2_818,
            root: "0xb0a8c9d25a3b710640c2b5a0e8d4961c975b3a28",
            sourceTx: "0xff55667788990011223344ff55667788990011223344ff55667788990011ff55",
            destinationTx: "0x5566aabbccddeeff00115566aabbccddeeff00115566aabbccddeeff00115566",
            settledAt: "2026-03-10T14:25:30Z",
          },
        ],
      },
    ],
  },

  "token-gas": {
    slug: "token-gas",
    label: "GAS Token Bridge",
    directions: [
      {
        sourceChain: "neo_n3",
        destinationChain: "neo_x",
        operations: [
          {
            nonce: 8_102,
            root: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
            sourceTx: "0xaa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44",
            destinationTx: "0x6677aabbccddeeff00116677aabbccddeeff00116677aabbccddeeff00116677",
            settledAt: "2026-03-10T14:31:55Z",
          },
          {
            nonce: 8_101,
            root: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
            sourceTx: "0xbb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55",
            destinationTx: "0x7788aabbccddeeff00117788aabbccddeeff00117788aabbccddeeff00117788",
            settledAt: "2026-03-10T14:28:30Z",
          },
        ],
      },
      {
        sourceChain: "neo_x",
        destinationChain: "neo_n3",
        operations: [
          {
            nonce: 7_450,
            root: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
            sourceTx: "0xcc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66",
            destinationTx: "0x8899aabbccddeeff00118899aabbccddeeff00118899aabbccddeeff00118899",
            settledAt: "2026-03-10T14:30:20Z",
          },
        ],
      },
    ],
  },
};
