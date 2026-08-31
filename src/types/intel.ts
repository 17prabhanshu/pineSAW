export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EntityType = 
  | 'VENDOR' 
  | 'WALLET' 
  | 'PGP_KEY' 
  | 'CONTACT' 
  | 'LISTING' 
  | 'MARKETPLACE'
  | 'BANK_ACCOUNT';

export interface CryptoWalletItem {
  network: 'BITCOIN' | 'MONERO' | 'ETHEREUM' | 'USDT';
  address: string;
  type: string;
  firstSeen: string;
  balanceEstimate?: string;
  txCount?: number;
}

export interface ContactHandleItem {
  platform: 'TELEGRAM' | 'PROTONMAIL' | 'SESSION' | 'TOX' | 'WICKR';
  handle: string;
  verified: boolean;
}

export interface IntelEvent {
  id: string;
  timestamp: string;
  source: 'GenesisMarket (.onion)' | 'Telegram Stream' | 'AlphaBay Mirror' | 'Torrez Hub';
  vendorAlias: string;
  title: string;
  snippet: string;
  severity: ThreatSeverity;
  wallets: CryptoWalletItem[];
  handles: ContactHandleItem[];
  pgpKeyId?: string;
  contraband: string[];
  torCircuitId: string;
  confidenceScore: number;
  rawJson: Record<string, any>;
}

export interface TelemetryPoint {
  time: string;
  eventsPerSec: number;
  circuitsActive: number;
  bandwidthMbps: number;
}

export interface IdentityCluster {
  clusterId: string;
  primaryActor: string;
  aliases: string[];
  sharedPgpKey: string;
  linkedWallets: number;
  totalVolumeUsd: string;
  lastActive: string;
  confidence: number;
}

export interface TorCircuitNode {
  id: string;
  relay: string;
  guardIp: string;
  exitCountry: string;
  latencyMs: number;
  status: 'ACTIVE' | 'ROTATING' | 'STANDBY';
  requestsProcessed: number;
}
