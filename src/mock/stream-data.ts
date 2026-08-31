import { IntelEvent, TelemetryPoint, IdentityCluster, TorCircuitNode } from "@/types/intel";

export const INITIAL_INTEL_STREAM: IntelEvent[] = [
  {
    id: "EVT-9042-ALPHA",
    timestamp: "Just now",
    source: "GenesisMarket (.onion)",
    vendorAlias: "ShadowBroker",
    title: "Pharma Grade M30 (Dirty 30s) Bulk Package",
    snippet: "1,000 pressed tablets ready for regional distribution. Escrow active. Settlement strictly via SegWit or Monero.",
    severity: "CRITICAL",
    wallets: [
      {
        network: "BITCOIN",
        address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
        type: "Bech32 SegWit",
        firstSeen: "2026-08-14",
        balanceEstimate: "14.85 BTC",
        txCount: 42
      },
      {
        network: "MONERO",
        address: "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGeiSTGh3hfrf2KmFrU6qi8nUQLgB3TDA262NjNev",
        type: "Standard XMR",
        firstSeen: "2026-08-20"
      }
    ],
    handles: [
      { platform: "TELEGRAM", handle: "@shadow_broker_t", verified: true },
      { platform: "PROTONMAIL", handle: "shadow99@proton.me", verified: true }
    ],
    pgpKeyId: "4A7B 89C1 DE34 F012",
    contraband: ["Fentanyl M30", "Counterfeit Oxycodone", "Pressed Tablets"],
    torCircuitId: "pinesaw_circ_88f9a2",
    confidenceScore: 0.98,
    rawJson: {
      market_id: 84920,
      escrow_status: "LOCKED_IN_MULTISIG",
      origin_country: "IN",
      observed_hops: 3
    }
  },
  {
    id: "EVT-8812-BETA",
    timestamp: "12s ago",
    source: "Telegram Stream",
    vendorAlias: "NeonNinja",
    title: "High Purity Ice Shards & Ketamine HCL",
    snippet: "Vacuum sealed drops across Sector 17 & 35. Direct payment to Ethereum gateway or cash drop.",
    severity: "HIGH",
    wallets: [
      {
        network: "ETHEREUM",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        type: "ERC-20 USDT Gateway",
        firstSeen: "2026-07-29",
        balanceEstimate: "45.2 ETH",
        txCount: 118
      }
    ],
    handles: [
      { platform: "TELEGRAM", handle: "@neon_supply_chd", verified: true },
      { platform: "SESSION", handle: "05a8f4c291827364b91029384756c8192837465a918273645e918273645a8192", verified: false }
    ],
    contraband: ["Methamphetamine", "Ice Shards", "Ketamine HCL"],
    torCircuitId: "pinesaw_circ_77a11e",
    confidenceScore: 0.91,
    rawJson: {
      telegram_chat_id: -100192837482,
      forward_peer_id: 99182736,
      media_hashes: ["phash_88f9102c9182a173"]
    }
  },
  {
    id: "EVT-7631-GAMMA",
    timestamp: "45s ago",
    source: "AlphaBay Mirror",
    vendorAlias: "GhostProtocol",
    title: "Afghan Kush & MDMA Crystal Bricks",
    snippet: "Grade A import from Golden Crescent route. Multichannel dead drop coordinates encrypted via PGP.",
    severity: "HIGH",
    wallets: [
      {
        network: "BITCOIN",
        address: "bc1p5d7rjq7g6rd2ee07rrjc9a6s98x5z0am25q5re8j6ctc309xhnqsc3w980",
        type: "Taproot (v1)",
        firstSeen: "2026-08-25",
        balanceEstimate: "3.2 BTC",
        txCount: 14
      }
    ],
    handles: [
      { platform: "TELEGRAM", handle: "@ghost_drop_2026", verified: true },
      { platform: "PROTONMAIL", handle: "ghostprotocol@proton.me", verified: true }
    ],
    pgpKeyId: "B12C 9901 88FA D902",
    contraband: ["Afghan Kush", "MDMA Rock", "Hashish"],
    torCircuitId: "pinesaw_circ_10b48c",
    confidenceScore: 0.89,
    rawJson: {
      market_id: 33104,
      vendor_trust_level: "TIER_4_VERIFIED"
    }
  }
];

export const INITIAL_TELEMETRY: TelemetryPoint[] = [
  { time: "17:00", eventsPerSec: 14.2, circuitsActive: 48, bandwidthMbps: 8.4 },
  { time: "17:05", eventsPerSec: 18.6, circuitsActive: 50, bandwidthMbps: 11.2 },
  { time: "17:10", eventsPerSec: 24.1, circuitsActive: 50, bandwidthMbps: 16.5 },
  { time: "17:15", eventsPerSec: 21.8, circuitsActive: 49, bandwidthMbps: 14.1 },
  { time: "17:20", eventsPerSec: 32.5, circuitsActive: 50, bandwidthMbps: 22.8 },
  { time: "17:25", eventsPerSec: 39.4, circuitsActive: 50, bandwidthMbps: 27.6 },
  { time: "17:30", eventsPerSec: 42.0, circuitsActive: 50, bandwidthMbps: 31.2 },
];

export const ACTIVE_CLUSTER: IdentityCluster = {
  clusterId: "CLUSTER-IND-0042",
  primaryActor: "ShadowBroker (Key Kingpin)",
  aliases: ["@shadow_broker_t", "shadow99", "PharmaKing99", "ChandigarhDrop01"],
  sharedPgpKey: "4A7B 89C1 DE34 F012",
  linkedWallets: 6,
  totalVolumeUsd: "$384,200 USD",
  lastActive: "Today at 17:18 UTC",
  confidence: 0.985
};

export const TOR_PROXY_NODES: TorCircuitNode[] = [
  { id: "TOR-NODE-01", relay: "Guard-CH-04", guardIp: "185.220.101.5", exitCountry: "Switzerland (CH)", latencyMs: 142, status: "ACTIVE", requestsProcessed: 1420 },
  { id: "TOR-NODE-02", relay: "Guard-NL-12", guardIp: "194.165.16.88", exitCountry: "Netherlands (NL)", latencyMs: 118, status: "ACTIVE", requestsProcessed: 2189 },
  { id: "TOR-NODE-03", relay: "Guard-SE-09", guardIp: "185.100.87.202", exitCountry: "Sweden (SE)", latencyMs: 164, status: "ROTATING", requestsProcessed: 980 },
  { id: "TOR-NODE-04", relay: "Guard-IS-01", guardIp: "193.187.91.44", exitCountry: "Iceland (IS)", latencyMs: 189, status: "ACTIVE", requestsProcessed: 1740 },
];

// Generator for synthetic real-time event pulses
const SYNTHETIC_VENDORS = ["SilkMerchant", "CryptoDrift", "ViperKush", "PharmaGhost", "DarkHaven24"];
const SYNTHETIC_SUBSTANCES = [
  ["Xanax 2mg", "Alprazolam"],
  ["Dirty 30s", "Fentanyl M30"],
  ["Ice Shards", "Crystal Meth"],
  ["China White", "Heroin Analogue"],
  ["Ketamine Vials", "Liquid Ket"]
];

export function generateRandomIntelEvent(): IntelEvent {
  const vendor = SYNTHETIC_VENDORS[Math.floor(Math.random() * SYNTHETIC_VENDORS.length)];
  const substance = SYNTHETIC_SUBSTANCES[Math.floor(Math.random() * SYNTHETIC_SUBSTANCES.length)];
  const btcRand = Math.random().toString(36).substring(2, 12);
  const randNum = Math.floor(Math.random() * 9000) + 1000;

  return {
    id: `EVT-${randNum}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: "Just now",
    source: Math.random() > 0.5 ? "GenesisMarket (.onion)" : "Telegram Stream",
    vendorAlias: vendor,
    title: `${substance[0]} Express Parcel (${Math.floor(Math.random() * 500) + 50} units)`,
    snippet: `Automated detection from intercepted packet. Verified crypto gateway and encrypted handle attached.`,
    severity: Math.random() > 0.6 ? "CRITICAL" : "HIGH",
    wallets: [
      {
        network: "BITCOIN",
        address: `bc1q${btcRand}98x5z0am25q5re8j6ctc309xhnq`,
        type: "Bech32 SegWit",
        firstSeen: "2026-08-31",
        balanceEstimate: `${(Math.random() * 8 + 0.5).toFixed(2)} BTC`,
        txCount: Math.floor(Math.random() * 60) + 5
      }
    ],
    handles: [
      { platform: "TELEGRAM", handle: `@${vendor.toLowerCase()}_drop`, verified: true },
      { platform: "PROTONMAIL", handle: `${vendor.toLowerCase()}99@proton.me`, verified: true }
    ],
    pgpKeyId: `${Math.random().toString(36).substring(2, 6).toUpperCase()} ${Math.random().toString(36).substring(2, 6).toUpperCase()} 88FA`,
    contraband: [substance[0], substance[1]],
    torCircuitId: `pinesaw_circ_${Math.random().toString(36).substring(2, 8)}`,
    confidenceScore: parseFloat((Math.random() * 0.1 + 0.89).toFixed(2)),
    rawJson: {
      automated_ingest: true,
      packet_id: Math.floor(Math.random() * 1000000)
    }
  };
}
