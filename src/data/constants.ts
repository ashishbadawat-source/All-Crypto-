import { AssetConfig, AssetType, Wallet, Transaction, User } from '../types';

export const ASSET_CONFIGS: Record<AssetType, AssetConfig> = {
  BTC: {
    type: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Mainnet (SegWit)',
    networkBadge: 'BTC Network',
    usdRate: 94840,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: 'Bitcoin',
    decimals: 8,
    unit: 'sats',
    explorerUrl: 'https://mempool.space/tx/',
    standard: 'UTXO Native'
  },
  USDT_TRC20: {
    type: 'USDT_TRC20',
    name: 'Tether USD (TRC-20)',
    symbol: 'USDT',
    network: 'TRON TRC-20 High Speed',
    networkBadge: 'TRC-20',
    usdRate: 1.00,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: 'DollarSign',
    decimals: 6,
    unit: 'SUN',
    explorerUrl: 'https://tronscan.org/#/transaction/',
    standard: 'TRC-20 Token'
  },
  TRX: {
    type: 'TRX',
    name: 'TRON Native',
    symbol: 'TRX',
    network: 'TRON Mainnet Energy Net',
    networkBadge: 'TRON Native',
    usdRate: 0.2845,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: 'Flame',
    decimals: 6,
    unit: 'SUN',
    explorerUrl: 'https://tronscan.org/#/transaction/',
    standard: 'TRX Core'
  },
  ETH: {
    type: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum Mainnet ERC-20',
    networkBadge: 'ERC-20',
    usdRate: 3485,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    icon: 'Layers',
    decimals: 18,
    unit: 'Gwei',
    explorerUrl: 'https://etherscan.io/tx/',
    standard: 'ERC-20'
  }
};

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'wallet-main',
    name: 'Primary Flash Generator Vault',
    nameHi: 'प्राइमरी 300-दिन फ्लैश जनरेटर वॉलेट',
    type: 'sender',
    addressBtc: 'bc1q9v3x0k4u8z5e7p2q8y5m6n4c3v2x1a9z0k4u8z',
    addressTron: 'TX8r5q9Pz2mK1n4u7V6y8w0X3j5k9L2m4n',
    addressEth: '0x71C38283E20F0D8E73B90B5548f71B4eE3B128e4',
    balances: {
      BTC: 3.50,
      USDT_TRC20: 75000,
      TRX: 250000,
      ETH: 15.0
    },
    color: 'from-amber-500/20 to-orange-600/20',
    iconName: 'ShieldCheck',
    createdAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: 'wallet-receiver-1',
    name: 'Trust Wallet (Mobile Target)',
    nameHi: 'ट्रस्ट वॉलेट (मोबाइल टारगेट)',
    type: 'receiver',
    addressBtc: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    addressTron: 'TNPwZzZ6V6B8pP3j2mK1n4u7V6y8w0X3j5',
    addressEth: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    balances: {
      BTC: 0,
      USDT_TRC20: 0,
      TRX: 0,
      ETH: 0
    },
    color: 'from-cyan-500/20 to-blue-600/20',
    iconName: 'Smartphone',
    createdAt: Date.now() - 3600000 * 24 * 1
  },
  {
    id: 'wallet-binance',
    name: 'Binance Exchange (Spot & Funding Vault)',
    nameHi: 'बाइनेंस एक्सचेंज खाता (स्पॉट एवं फंडिंग)',
    type: 'receiver',
    addressBtc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    addressTron: 'TLyqzVGLV1srkB7dToTAwdg296WC972c9y',
    addressEth: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    balances: {
      BTC: 1.50,
      USDT_TRC20: 35000,
      TRX: 120000,
      ETH: 6.5
    },
    color: 'from-yellow-500/20 to-amber-600/20',
    iconName: 'Building2',
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: 'wallet-receiver-3',
    name: 'Ledger Cold Storage Hardware',
    nameHi: 'लेज़र कोल्ड स्टोरेज हार्डवेयर',
    type: 'receiver',
    addressBtc: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    addressTron: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
    addressEth: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    balances: {
      BTC: 0,
      USDT_TRC20: 0,
      TRX: 0,
      ETH: 0
    },
    color: 'from-purple-500/20 to-indigo-600/20',
    iconName: 'HardDrive',
    createdAt: Date.now() - 3600000 * 6
  },
  {
    id: 'wallet-metamask',
    name: 'MetaMask (Web3 Multi-Chain)',
    nameHi: 'मेटामास्क (वेब3 मल्टी-चेन)',
    type: 'receiver',
    addressBtc: 'bc1qp72c3v4u8z5e7p2q8y5m6n4c3v2x1a9z0k4u8z',
    addressTron: 'TDzR3v2mK1n4u7V6y8w0X3j5k9L2m4nP9s',
    addressEth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    balances: {
      BTC: 0.50,
      USDT_TRC20: 10000,
      TRX: 45000,
      ETH: 2.5
    },
    color: 'from-orange-500/20 to-amber-600/20',
    iconName: 'Smartphone',
    createdAt: Date.now() - 3600000 * 8
  },
  {
    id: 'wallet-tronlink',
    name: 'TronLink Pro (TRC-20 Hub)',
    nameHi: 'ट्रॉनलिंक प्रो (TRC-20 हब)',
    type: 'receiver',
    addressBtc: 'bc1q5v8w0x3j5k9l2m4n7p2q8y5m6n4c3v2x1a9z',
    addressTron: 'TXfV2mK1n4u7V6y8w0X3j5k9L2m4n9sWWc',
    addressEth: '0x53d284357ec70cE289D6D64134DfAc8E511c8a3D',
    balances: {
      BTC: 0,
      USDT_TRC20: 20000,
      TRX: 85000,
      ETH: 0
    },
    color: 'from-red-500/20 to-rose-600/20',
    iconName: 'Smartphone',
    createdAt: Date.now() - 3600000 * 4
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-init-1',
    txid: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    assetType: 'BTC',
    amount: 2.0,
    fee: 0.00015,
    feeAsset: 'BTC',
    fromWalletId: 'external-faucet',
    fromAddress: 'bc1q9v3x0k4u8z5e7p2q8y5m6n4c3v2x1a9z0k4u8z',
    toWalletId: 'wallet-main',
    toAddress: 'bc1q9v3x0k4u8z5e7p2q8y5m6n4c3v2x1a9z0k4u8z',
    timestamp: Date.now() - 3600000 * 5,
    status: 'CONFIRMED',
    confirmations: 18,
    maxConfirmations: 6,
    blockHeight: 894120,
    validityDays: 300,
    expiresAt: Date.now() + 300 * 86400000 - 3600000 * 5,
    memo: '300-Day Flash Asset Mint Initial Batch'
  },
  {
    id: 'tx-init-2',
    txid: '9f82d1c6a7e54b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c',
    assetType: 'USDT_TRC20',
    amount: 50000,
    fee: 14.5,
    feeAsset: 'TRX',
    fromWalletId: 'external-faucet',
    fromAddress: 'TX8r5q9Pz2mK1n4u7V6y8w0X3j5k9L2m4n',
    toWalletId: 'wallet-main',
    toAddress: 'TX8r5q9Pz2mK1n4u7V6y8w0X3j5k9L2m4n',
    timestamp: Date.now() - 3600000 * 3,
    status: 'CONFIRMED',
    confirmations: 64,
    maxConfirmations: 19,
    blockHeight: 68194021,
    validityDays: 300,
    expiresAt: Date.now() + 300 * 86400000 - 3600000 * 3,
    memo: 'TRC-20 300-Day Flash Contract Deployment'
  }
];

export const DEFAULT_DEMO_USERS: User[] = [
  {
    id: 'user-ashish',
    name: 'Ashish Badawat',
    email: 'ashishbadawat@gmail.com',
    pin: '1234',
    mnemonic: 'orbit galaxy quantum matrix nebula cipher crystal rocket vector echo phantom beacon',
    kycTier: 3,
    is2FAEnabled: true,
    avatarSeed: 'ashish',
    createdAt: Date.now() - 3600000 * 24 * 30,
    lastLoginAt: Date.now()
  },
  {
    id: 'user-demo-1',
    name: 'Crypto Trader (Pro)',
    email: 'trader@flashcrypto.sandbox',
    pin: '8888',
    mnemonic: 'genesis apex zenith pulse neutron aurora hyper crypto shadow stellar binary plasma',
    kycTier: 2,
    is2FAEnabled: true,
    avatarSeed: 'crypto_trader',
    createdAt: Date.now() - 3600000 * 24 * 7,
    lastLoginAt: Date.now()
  }
];
