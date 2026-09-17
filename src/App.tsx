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
  LayoutDashboard,
  Layers
} from 'lucide-react';
import { Language, AssetType, Wallet, Transaction, User } from './types';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS, ASSET_CONFIGS, DEFAULT_DEMO_USERS } from './data/constants';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { PortfolioOverview } from './components/PortfolioOverview';
import { AssetGenerator } from './components/AssetGenerator';
import { TransferEngine } from './components/TransferEngine';
import { ValidityLifecycleViewer } from './components/ValidityLifecycleViewer';
import { WalletHub } from './components/WalletHub';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { EducationalInsight } from './components/EducationalInsight';
import { QrCodeModal } from './components/QrCodeModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { generateAddress, generateTxid, playAudioFeedback } from './utils/cryptoUtils';

export default function App() {
  // Default to Hindi as user requested in Hindi, toggleable to English anytime
  const [language, setLanguage] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<string>('generator');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flash_crypto_active_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* no-op */ }
    }
    return DEFAULT_DEMO_USERS[0];
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Persistent or initial states
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('flash_crypto_wallets');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* no-op */ }
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

  // 200-Day Validity tracking
  const [simulatedDays, setSimulatedDays] = useState<number>(() => {
    const saved = localStorage.getItem('flash_crypto_sim_days');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [initialExpiryTimestamp] = useState<number>(() => {
    const saved = localStorage.getItem('flash_crypto_expiry_ts');
    if (saved) return parseInt(saved, 10);
    const ts = Date.now() + (200 * 86400000);
    localStorage.setItem('flash_crypto_expiry_ts', ts.toString());
    return ts;
  });

  const [blockHeight, setBlockHeight] = useState<number>(894125);

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
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  // Effective wallets with 200-day expiration calculation
  // If simulatedDays >= 200, balance expires/disappears as requested
  const effectiveWallets: Wallet[] = wallets.map(w => {
    if (simulatedDays >= 200) {
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
              [assetType]: (w.balances[assetType] || 0) + amount
            }
          };
        }
        return w;
      })
    );

    const targetWallet = wallets.find(w => w.id === targetWalletId);
    const targetAddress = assetType === 'BTC' ? targetWallet?.addressBtc : (assetType === 'USDT_TRC20' || assetType === 'TRX') ? targetWallet?.addressTron : targetWallet?.addressEth;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txid: generateTxid(),
      assetType,
      amount,
      fee: 0.0001,
      feeAsset: assetType === 'BTC' ? 'BTC' : assetType === 'ETH' ? 'ETH' : 'TRX',
      fromWalletId: 'genesis-mint-contract',
      fromAddress: '0x0000000000000000000000000000000000000000',
      toWalletId: targetWalletId,
      toAddress: targetAddress || 'External Address',
      timestamp: Date.now(),
      status: 'CONFIRMED',
      confirmations: 6,
      maxConfirmations: 6,
      blockHeight: blockHeight + 1,
      validityDays: 200,
      expiresAt: Date.now() + (200 * 86400000),
      memo: memo || '200-Day Flash Crypto Mint'
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Handler: Send / Transfer transaction
  const handleSendTransaction = (
    fromWalletId: string,
    toAddress: string,
    assetType: AssetType,
    amount: number,
    fee: number,
    toWalletId?: string
  ) => {
    const sender = wallets.find(w => w.id === fromWalletId);
    const senderAddress = sender ? (assetType === 'BTC' ? sender.addressBtc : (assetType === 'USDT_TRC20' || assetType === 'TRX') ? sender.addressTron : sender.addressEth) : '';

    // Update balances
    setWallets(prev =>
      prev.map(w => {
        if (w.id === fromWalletId) {
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: Math.max(0, (w.balances[assetType] || 0) - amount)
            }
          };
        }
        if (toWalletId && w.id === toWalletId) {
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: (w.balances[assetType] || 0) + amount
            }
          };
        }
        // Also check if toAddress matches any wallet's address directly
        if (w.addressBtc === toAddress || w.addressTron === toAddress || w.addressEth === toAddress) {
          return {
            ...w,
            balances: {
              ...w.balances,
              [assetType]: (w.balances[assetType] || 0) + amount
            }
          };
        }
        return w;
      })
    );

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txid: generateTxid(),
      assetType,
      amount,
      fee,
      feeAsset: assetType === 'BTC' ? 'BTC' : assetType === 'ETH' ? 'ETH' : 'TRX',
      fromWalletId,
      fromAddress: senderAddress,
      toWalletId,
      toAddress,
      timestamp: Date.now(),
      status: 'CONFIRMED',
      confirmations: 6,
      maxConfirmations: 6,
      blockHeight: blockHeight + 1,
      validityDays: 200,
      expiresAt: Date.now() + (200 * 86400000),
      memo: 'Simulated Network Transfer'
    };

    setTransactions(prev => [newTx, ...prev]);
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        blockHeight={blockHeight}
        simulatedDays={simulatedDays}
        onReset={handleResetSandbox}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Portfolio Summary & 200-Day Countdown Card */}
        <PortfolioOverview
          primaryWallet={primaryWallet}
          allWallets={effectiveWallets}
          language={language}
          simulatedDays={simulatedDays}
          initialExpiryTimestamp={initialExpiryTimestamp}
          onNavigateTab={setActiveTab}
        />

        {/* Tab Navigation Navigation Bar */}
        <div className="border-b border-slate-800 flex overflow-x-auto gap-1 sm:gap-2 pb-px">
          
          <button
            id="tab-generator-btn"
            onClick={() => { setActiveTab('generator'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'generator'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{t.tabGenerator}</span>
          </button>

          <button
            id="tab-transfer-btn"
            onClick={() => { setActiveTab('transfer'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'transfer'
                ? 'border-emerald-400 text-emerald-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{t.tabTransfer}</span>
          </button>

          <button
            id="tab-wallets-btn"
            onClick={() => { setActiveTab('wallets'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'wallets'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <WalletIcon className="w-4 h-4" />
            <span>{t.tabWallets}</span>
          </button>

          <button
            id="tab-lifecycle-btn"
            onClick={() => { setActiveTab('lifecycle'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'lifecycle'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.tabLifecycle}</span>
          </button>

          <button
            id="tab-explorer-btn"
            onClick={() => { setActiveTab('explorer'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'border-indigo-400 text-indigo-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.tabExplorer}</span>
          </button>

          <button
            id="tab-security-btn"
            onClick={() => { setActiveTab('security'); playAudioFeedback('click'); }}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-purple-400 text-purple-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.tabSecurity}</span>
          </button>

        </div>

        {/* Tab Content Panels */}
        <div className="pt-2">
          
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
              onNavigateTab={setActiveTab}
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
            <BlockchainExplorer
              transactions={transactions}
              language={language}
              blockHeight={blockHeight}
            />
          )}

          {activeTab === 'security' && (
            <EducationalInsight
              language={language}
            />
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2 text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Flash Crypto Sandbox &amp; 200-Day Expiration Simulator</span>
            <span>•</span>
            <span className="font-mono">BTC • USDT (TRC-20) • TRX • ETH</span>
          </div>
          <p className="text-[11px] text-slate-600 max-w-2xl mx-auto">
            {language === 'hi'
              ? 'यह वेबसाइट 200-दिन वैलिडिटी, टाइम-लॉक स्मार्ट कॉन्ट्रैक्ट्स और मल्टी-वॉलेट ट्रांसफर को सिम्युलेट करने के लिए एक शैक्षिक लैब है।'
              : 'Interactive cryptocurrency testnet sandbox designed for studying 200-day time-lock lifecycles, mempool propagation, and multi-wallet transfers.'}
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

      {/* Authentication Modal (Register / Login / Seed Phrase) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        language={language}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isDismissable={true}
      />

      {/* User Profile & Security Modal */}
      {currentUser && isProfileModalOpen && (
        <UserProfileModal
          user={currentUser}
          language={language}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      )}

    </div>
  );
}
