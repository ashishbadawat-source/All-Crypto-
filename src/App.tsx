/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRightLeft,
  Wallet as WalletIcon,
  Clock,
  Database,
  ShieldCheck,
  TrendingUp,
  ArrowDownUp,
  Layers,
  Box
} from 'lucide-react';
import { Language, AssetType, Wallet, Transaction, User, AuthMode } from './types';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS, ASSET_CONFIGS, DEFAULT_DEMO_USERS } from './data/constants';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { MarketTickerBar } from './components/MarketTickerBar';
import { CryptoShowcaseGrid } from './components/CryptoShowcaseGrid';
import { LiveCryptoChart } from './components/LiveCryptoChart';
import { InstantSwapEngine } from './components/InstantSwapEngine';
import { MempoolVisualizer } from './components/MempoolVisualizer';
import { PortfolioOverview } from './components/PortfolioOverview';
import { AssetGenerator } from './components/AssetGenerator';
import { TransferEngine } from './components/TransferEngine';
import { ValidityLifecycleViewer } from './components/ValidityLifecycleViewer';
import { WalletHub } from './components/WalletHub';
import { BinanceWalletHub } from './components/BinanceWalletHub';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { EducationalInsight } from './components/EducationalInsight';
import { QrCodeModal } from './components/QrCodeModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Web3ConnectModal } from './components/Web3ConnectModal';
import { CryptoReceiptModal } from './components/CryptoReceiptModal';
import { generateAddress, generateTxid, playAudioFeedback } from './utils/cryptoUtils';

export default function App() {
  // Default to Hindi as user requested in Hindi, toggleable to English anytime
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<string>('market');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flash_crypto_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* no-op */ }
    }
    return DEFAULT_DEMO_USERS[0];
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Web3 Connection State
  const [connectedWeb3Wallet, setConnectedWeb3Wallet] = useState<string | null>(() => {
    return localStorage.getItem('flash_crypto_web3_wallet') || 'TronLink (Connected)';
  });
  const [isWeb3ModalOpen, setIsWeb3ModalOpen] = useState<boolean>(false);

  // Active Transaction for Receipt Modal
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Persistent or initial states
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('flash_crypto_wallets');
    if (saved) {
      try {
        const parsed: Wallet[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and merge to guarantee Binance and latest vaults exist
          const merged = parsed.map(w => {
            if (w.id === 'wallet-receiver-2') {
              return {
                ...w,
                id: 'wallet-binance',
                name: 'Binance Exchange (Spot & Funding Vault)',
                nameHi: 'बाइनेंस एक्सचेंज खाता (स्पॉट एवं फंडिंग)',
                balances: {
                  BTC: w.balances?.BTC || 1.50,
                  USDT_TRC20: w.balances?.USDT_TRC20 || 35000,
                  TRX: w.balances?.TRX || 120000,
                  ETH: w.balances?.ETH || 6.5
                }
              };
            }
            return w;
          });

          INITIAL_WALLETS.forEach(initW => {
            const hasWallet = merged.some(w => w.id === initW.id || (initW.id === 'wallet-binance' && w.id === 'wallet-receiver-2'));
            if (!hasWallet) {
              merged.push(initW);
            }
          });
          return merged;
        }
      } catch { /* no-op */ }
    }
    return INITIAL_WALLETS;
  });

  const [selectedWalletId, setSelectedWalletId] = useState<string>('wallet-main');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('flash_crypto_txs');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* no-op */ }
    }
    return INITIAL_TRANSACTIONS;
  });

  // 300-Day Validity tracking
  const [simulatedDays, setSimulatedDays] = useState<number>(() => {
    const saved = localStorage.getItem('flash_crypto_sim_days');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [initialExpiryTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem('flash_crypto_expiry_ts');
    if (saved) return parseInt(saved, 10);
    const ts = Date.now() + (300 * 86400000);
    localStorage.setItem('flash_crypto_expiry_ts', ts.toString());
    return ts;
  });

  const [blockHeight, setBlockHeight] = useState<number>(894128);

  // QR Modal State
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; address: string; title: string }>({
    isOpen: false,
    address: '',
    title: ''
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('flash_crypto_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('flash_crypto_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('flash_crypto_sim_days', simulatedDays.toString());
  }, [simulatedDays]);

  // Periodic simulated block miner
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Effective wallets with 300-day expiration calculation
  const effectiveWallets: Wallet[] = wallets.map(w => {
    if (simulatedDays >= 300) {
      return {
        ...w,
        balances: {
          BTC: 0,
          USDT_TRC20: 0,
          TRX: 0,
          ETH: 0
        }
      };
    }
    return w;
  });

  const primaryWallet = effectiveWallets.find(w => w.id === selectedWalletId) || effectiveWallets[0];
  const t = translations[language];

  // Handler: Mint / Generate new flash crypto
  const handleMintAsset = (
    assetType: AssetType,
    amount: number,
    targetWalletId: string,
    validityDays: number,
    memo?: string
  ) => {
    setWallets(prev =>
      prev.map(w => {
        if (w.id === targetWalletId) {
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: Number((w.balances[assetType] + amount).toFixed(6))
            }
          };
        }
        return w;
      })
    );

    const targetWallet = wallets.find(w => w.id === targetWalletId) || wallets[0];
    const generatedTxid = generateTxid();
    const expiresAt = Date.now() + (validityDays * 86400000);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txid: generatedTxid,
      assetType,
      amount,
      fee: 0.0001,
      feeAsset: assetType === 'BTC' ? 'BTC' : assetType === 'ETH' ? 'ETH' : 'TRX',
      fromWalletId: 'mint-contract',
      fromAddress: '0x0000000000000000000000000000000000000000 (Flash Mint Pool)',
      toWalletId: targetWalletId,
      toAddress: assetType === 'BTC' ? targetWallet.addressBtc : assetType === 'ETH' ? targetWallet.addressEth : targetWallet.addressTron,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      confirmations: 6,
      maxConfirmations: 6,
      blockHeight,
      validityDays,
      expiresAt,
      memo: memo || `${validityDays}-Day Flash Asset Mined`
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Send transaction
  const handleSendTransaction = (
    fromWalletId: string,
    toAddress: string,
    assetType: AssetType,
    amount: number,
    fee: number,
    toWalletId?: string
  ) => {
    setWallets(prev => {
      // Find matching target wallet either by ID or by address or Binance keyword
      let resolvedToWalletId = toWalletId;
      if (!resolvedToWalletId) {
        const found = prev.find(
          w => w.addressBtc === toAddress || w.addressTron === toAddress || w.addressEth === toAddress
        );
        if (found) {
          resolvedToWalletId = found.id;
        } else if (
          toAddress === '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' ||
          toAddress === 'TLyqzVGLV1srkB7dToTAwdg296WC972c9y' ||
          toAddress === '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8' ||
          toAddress.toLowerCase().includes('binance')
        ) {
          resolvedToWalletId = 'wallet-binance';
        }
      }

      return prev.map(w => {
        if (w.id === fromWalletId) {
          const currentBal = w.balances[assetType] || 0;
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: Math.max(0, Number((currentBal - amount).toFixed(6)))
            }
          };
        }

        const isTarget =
          (resolvedToWalletId && (w.id === resolvedToWalletId || (resolvedToWalletId === 'wallet-binance' && (w.id === 'wallet-binance' || w.id === 'wallet-receiver-2')))) ||
          w.addressBtc === toAddress ||
          w.addressTron === toAddress ||
          w.addressEth === toAddress;

        if (isTarget) {
          const currentBal = w.balances[assetType] || 0;
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: Number((currentBal + amount).toFixed(6))
            }
          };
        }
        return w;
      });
    });

    const sender = wallets.find(w => w.id === fromWalletId) || wallets[0];
    const generatedTxid = generateTxid();
    const expiresAt = Date.now() + (300 * 86400000);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txid: generatedTxid,
      assetType,
      amount,
      fee,
      feeAsset: assetType === 'BTC' ? 'BTC' : assetType === 'ETH' ? 'ETH' : 'TRX',
      fromWalletId,
      fromAddress: assetType === 'BTC' ? sender.addressBtc : assetType === 'ETH' ? sender.addressEth : sender.addressTron,
      toWalletId,
      toAddress,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      confirmations: 6,
      maxConfirmations: 6,
      blockHeight,
      validityDays: 300,
      expiresAt,
      memo: 'P2P On-Chain Transfer'
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Execute Instant Swap
  const handleExecuteSwap = (
    fromAsset: AssetType,
    toAsset: AssetType,
    fromAmount: number,
    toAmount: number
  ) => {
    setWallets(prev =>
      prev.map(w => {
        if (w.id === selectedWalletId) {
          return {
            ...w,
            balances: {
              ...w.balances,
              [fromAsset]: Math.max(0, Number((w.balances[fromAsset] - fromAmount).toFixed(6))),
              [toAsset]: Number((w.balances[toAsset] + toAmount).toFixed(6))
            }
          };
        }
        return w;
      })
    );

    const sender = wallets.find(w => w.id === selectedWalletId) || wallets[0];
    const generatedTxid = generateTxid();

    const swapTx: Transaction = {
      id: `swap-${Date.now()}`,
      txid: generatedTxid,
      assetType: toAsset,
      amount: toAmount,
      fee: 0.0001,
      feeAsset: 'TRX',
      fromWalletId: selectedWalletId,
      fromAddress: `${fromAmount} ${ASSET_CONFIGS[fromAsset].symbol} Swap Pool`,
      toWalletId: selectedWalletId,
      toAddress: sender.addressTron,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      confirmations: 6,
      maxConfirmations: 6,
      blockHeight,
      validityDays: 300,
      expiresAt: Date.now() + (300 * 86400000),
      memo: `Instant Swap: ${fromAmount} ${fromAsset} ➔ ${toAmount.toFixed(4)} ${toAsset}`
    };

    setTransactions(prev => [swapTx, ...prev]);
  };

  // Handler: Add new simulated wallet
  const handleAddWallet = (name: string, nameHi: string) => {
    const newW: Wallet = {
      id: `wallet-custom-${Date.now()}`,
      name,
      nameHi,
      type: 'receiver',
      addressBtc: generateAddress('BTC'),
      addressTron: generateAddress('USDT_TRC20'),
      addressEth: generateAddress('ETH'),
      balances: {
        BTC: 0,
        USDT_TRC20: 0,
        TRX: 0,
        ETH: 0
      },
      color: 'from-emerald-500/20 to-teal-600/20',
      iconName: 'Wallet',
      createdAt: Date.now()
    };

    setWallets(prev => [...prev, newW]);
    setSelectedWalletId(newW.id);
  };

  // Auth handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('flash_crypto_active_user');
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    playAudioFeedback('expire');
  };

  const handleUpdateUser = (updated: User) => {
    setCurrentUser(updated);
    localStorage.setItem('flash_crypto_active_user', JSON.stringify(updated));
  };

  // Web3 Connect handler
  const handleConnectWeb3 = (walletName: string) => {
    setConnectedWeb3Wallet(walletName);
    localStorage.setItem('flash_crypto_web3_wallet', walletName);
  };

  // Reset sandbox
  const handleResetSandbox = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप सिम्युलेटर डेटा रीसेट करना चाहते हैं?' : 'Reset all sandbox data to initial state?')) {
      localStorage.removeItem('flash_crypto_wallets');
      localStorage.removeItem('flash_crypto_txs');
      localStorage.removeItem('flash_crypto_sim_days');
      localStorage.removeItem('flash_crypto_expiry_ts');
      setWallets(INITIAL_WALLETS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSimulatedDays(0);
      playAudioFeedback('success');
    }
  };

  // Navigate tab from showcase actions
  const handleShowcaseAction = (tab: string, assetType?: AssetType) => {
    setActiveTab(tab);
    playAudioFeedback('click');
  };

  const binanceWallet = effectiveWallets.find(w => w.id === 'wallet-binance' || w.id === 'wallet-receiver-2');
  const binanceBalanceUsd = binanceWallet
    ? (binanceWallet.balances.BTC * ASSET_CONFIGS.BTC.usdRate) +
      (binanceWallet.balances.USDT_TRC20 * ASSET_CONFIGS.USDT_TRC20.usdRate) +
      (binanceWallet.balances.TRX * ASSET_CONFIGS.TRX.usdRate) +
      (binanceWallet.balances.ETH * ASSET_CONFIGS.ETH.usdRate)
    : 89500;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Live Crypto Price Ticker Marquee */}
      <MarketTickerBar
        language={language}
        blockHeight={blockHeight}
        selectedNetwork={selectedNetwork}
        onSelectNetwork={setSelectedNetwork}
      />

      {/* Main App Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        blockHeight={blockHeight}
        simulatedDays={simulatedDays}
        onReset={handleResetSandbox}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        connectedWeb3Wallet={connectedWeb3Wallet}
        onOpenWeb3Connect={() => setIsWeb3ModalOpen(true)}
        onOpenBinance={() => {
          setActiveTab('binance');
          playAudioFeedback('click');
        }}
        binanceBalanceUsd={binanceBalanceUsd}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Top Portfolio Summary & 300-Day Countdown Card */}
        <PortfolioOverview
          primaryWallet={primaryWallet}
          allWallets={effectiveWallets}
          language={language}
          simulatedDays={simulatedDays}
          initialExpiryTimestamp={initialExpiryTimestamp}
          onNavigateTab={setActiveTab}
        />

        {/* 4-Core Crypto Showcase Grid (BTC, USDT TRC20, TRX, ETH) */}
        <CryptoShowcaseGrid
          language={language}
          onSelectAction={handleShowcaseAction}
        />

        {/* Tab Navigation Bar with Pro Crypto Icons */}
        <div className="border-b border-slate-800 flex overflow-x-auto gap-1 sm:gap-2 pb-px no-scrollbar">
          
          <button
            id="tab-market-btn"
            onClick={() => { setActiveTab('market'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'market'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{t.tabMarket}</span>
          </button>

          <button
            id="tab-generator-btn"
            onClick={() => { setActiveTab('generator'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'generator'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t.tabGenerator}</span>
          </button>

          <button
            id="tab-transfer-btn"
            onClick={() => { setActiveTab('transfer'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'transfer'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>{t.tabTransfer}</span>
          </button>

          <button
            id="tab-swap-btn"
            onClick={() => { setActiveTab('swap'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'swap'
                ? 'border-orange-400 text-orange-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ArrowDownUp className="w-4 h-4 text-orange-400" />
            <span>{t.tabSwap}</span>
          </button>

          <button
            id="tab-wallets-btn"
            onClick={() => { setActiveTab('wallets'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'wallets'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <WalletIcon className="w-4 h-4 text-cyan-400" />
            <span>{t.tabWallets}</span>
          </button>

          <button
            id="tab-binance-btn"
            onClick={() => { setActiveTab('binance'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'binance'
                ? 'border-yellow-400 text-yellow-300 bg-yellow-500/10'
                : 'border-transparent text-yellow-400/90 hover:text-yellow-300 hover:border-yellow-500/50'
            }`}
          >
            <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 rounded text-[9px] font-black">BINANCE</span>
            <span>{language === 'hi' ? '🟡 बाइनेंस हब' : '🟡 Binance Hub'}</span>
          </button>

          <button
            id="tab-lifecycle-btn"
            onClick={() => { setActiveTab('lifecycle'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'lifecycle'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{t.tabLifecycle}</span>
          </button>

          <button
            id="tab-explorer-btn"
            onClick={() => { setActiveTab('explorer'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>{t.tabExplorer}</span>
          </button>

          <button
            id="tab-security-btn"
            onClick={() => { setActiveTab('security'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-purple-400 text-purple-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>{t.tabSecurity}</span>
          </button>

        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          
          {activeTab === 'market' && (
            <div className="space-y-6">
              <LiveCryptoChart language={language} />
              <MempoolVisualizer
                language={language}
                blockHeight={blockHeight}
                transactions={transactions}
              />
            </div>
          )}

          {activeTab === 'generator' && (
            <AssetGenerator
              wallets={effectiveWallets}
              selectedWalletId={selectedWalletId}
              language={language}
              onMintAsset={handleMintAsset}
            />
          )}

          {activeTab === 'transfer' && (
            <TransferEngine
              wallets={effectiveWallets}
              selectedWalletId={selectedWalletId}
              language={language}
              onSendTransaction={handleSendTransaction}
              onQuickMintAsset={handleMintAsset}
              onViewReceipt={(tx: any) => setActiveReceiptTx(tx)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'swap' && (
            <InstantSwapEngine
              wallets={effectiveWallets}
              selectedWalletId={selectedWalletId}
              language={language}
              onExecuteSwap={handleExecuteSwap}
            />
          )}

          {activeTab === 'wallets' && (
            <WalletHub
              wallets={effectiveWallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              onAddWallet={handleAddWallet}
              transactions={transactions}
              language={language}
              onQuickMintAsset={handleMintAsset}
              onOpenQr={(address, title) => setQrModal({ isOpen: true, address, title })}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'binance' && (
            <BinanceWalletHub
              wallets={effectiveWallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              transactions={transactions}
              language={language}
              onQuickMintAsset={handleMintAsset}
              onSendTransaction={handleSendTransaction}
              onOpenQr={(address, title) => setQrModal({ isOpen: true, address, title })}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'lifecycle' && (
            <ValidityLifecycleViewer
              initialExpiryTimestamp={initialExpiryTimestamp}
              simulatedDays={simulatedDays}
              onSetSimulatedDays={setSimulatedDays}
              language={language}
              wallets={effectiveWallets}
            />
          )}

          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <MempoolVisualizer
                language={language}
                blockHeight={blockHeight}
                transactions={transactions}
              />
              <BlockchainExplorer
                transactions={transactions}
                language={language}
                blockHeight={blockHeight}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <EducationalInsight
              language={language}
            />
          )}

        </div>

      </main>

      {/* Crypto Terminal Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Flash Crypto Sandbox &amp; 300-Day Expiration Terminal</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">BTC • USDT (TRC-20) • TRX • ETH</span>
            <span>•</span>
            <span className="font-mono text-slate-500">P2P Mainnet Consensus</span>
          </div>
          <p className="text-[11px] text-slate-600 max-w-2xl mx-auto">
            {language === 'hi'
              ? '300-दिन वैलिडिटी, टाइम-लॉक स्मार्ट कॉन्ट्रैक्ट्स, मेमपूल प्रोपेगेशन और विकेंद्रीकृत वॉलेट ट्रांसफर के लिए एक उन्नत क्रिप्टो टर्मिनल।'
              : 'Institutional cryptocurrency testnet terminal designed for studying 300-day time-lock lifecycles, mempool propagation, and multi-wallet transfers.'}
          </p>
        </div>
      </footer>

      {/* QR Code Inspection Modal */}
      {qrModal.isOpen && (
        <QrCodeModal
          address={qrModal.address}
          title={qrModal.title}
          language={language}
          onClose={() => setQrModal({ isOpen: false, address: '', title: '' })}
        />
      )}

      {/* Official Crypto Transaction Receipt Voucher Modal */}
      {activeReceiptTx && (
        <CryptoReceiptModal
          transaction={activeReceiptTx}
          language={language}
          onClose={() => setActiveReceiptTx(null)}
        />
      )}

      {/* Web3 Connect Wallet Modal (MetaMask, TronLink, Trust Wallet, Ledger) */}
      <Web3ConnectModal
        isOpen={isWeb3ModalOpen}
        language={language}
        onClose={() => setIsWeb3ModalOpen(false)}
        onConnectWallet={handleConnectWeb3}
      />

      {/* Authentication Modal (Register / Login / Seed Phrase / Switch Users) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        language={language}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isDismissable={true}
      />

      {/* User Profile, Security & Account Management Modal */}
      {currentUser && isProfileModalOpen && (
        <UserProfileModal
          user={currentUser}
          language={language}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onOpenSwitchAccount={() => {
            setAuthModalMode('saved_accounts');
            setIsAuthModalOpen(true);
          }}
        />
      )}

    </div>
  );
}
