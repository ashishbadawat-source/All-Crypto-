export type AssetType = 'BTC' | 'USDT_TRC20' | 'TRX' | 'ETH';

export type AssetStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'TRANSFERRED';

export type TxStatus = 'BROADCASTING' | 'PENDING_MEMPOOL' | 'CONFIRMING' | 'CONFIRMED' | 'EXPIRED_PRUNED';

export interface FlashAsset {
  id: string;
  assetType: AssetType;
  amount: number;
  generatedAt: number; // Unix timestamp ms
  validityDays: number; // e.g. 200
  expiresAt: number; // Unix timestamp ms
  walletId: string;
  txid: string;
  status: AssetStatus;
  notes?: string;
  contractAddress?: string;
}

export interface Wallet {
  id: string;
  name: string;
  nameHi: string;
  type: 'sender' | 'receiver' | 'custom';
  addressBtc: string;
  addressTron: string;
  addressEth: string;
  balances: Record<AssetType, number>;
  color: string;
  iconName: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  txid: string;
  assetType: AssetType;
  amount: number;
  fee: number;
  feeAsset: string;
  fromWalletId: string;
  fromAddress: string;
  toWalletId?: string;
  toAddress: string;
  timestamp: number;
  status: TxStatus;
  confirmations: number;
  maxConfirmations: number;
  blockHeight: number;
  validityDays: number;
  expiresAt: number;
  gasUsed?: number;
  memo?: string;
}

export interface AssetConfig {
  type: AssetType;
  name: string;
  symbol: string;
  network: string;
  networkBadge: string;
  usdRate: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  decimals: number;
  unit: string;
  explorerUrl: string;
  standard: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  pin: string;
  mnemonic: string;
  kycTier: number; // 1, 2, 3
  is2FAEnabled: boolean;
  avatarSeed: string;
  createdAt: number;
  lastLoginAt: number;
}

export type AuthMode = 'login' | 'register' | 'mnemonic_login' | 'saved_accounts' | 'forgot_password';

export type Language = 'hi' | 'en';
