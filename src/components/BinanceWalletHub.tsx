import React, { useState } from 'react';
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  QrCode, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Wallet as WalletIcon,
  Sparkles,
  ArrowRightLeft,
  DollarSign,
  Clock,
  Send
} from 'lucide-react';
import { Wallet, Language, AssetType, Transaction } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { playAudioFeedback, truncateHash } from '../utils/cryptoUtils';

interface BinanceWalletHubProps {
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  transactions: Transaction[];
  language: Language;
  onQuickMintAsset: (assetType: AssetType, amount: number, targetWalletId: string, validityDays: number, memo?: string) => void;
  onSendTransaction: (fromWalletId: string, toAddress: string, assetType: AssetType, amount: number, fee: number, toWalletId?: string) => void;
  onOpenQr: (address: string, title: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const BinanceWalletHub: React.FC<BinanceWalletHubProps> = ({
  wallets,
  selectedWalletId,
  onSelectWallet,
  transactions,
  language,
  onQuickMintAsset,
  onSendTransaction,
  onOpenQr,
  onNavigateTab
}) => {
  const t = translations[language];

  const binanceWallet = wallets.find(w => w.id === 'wallet-binance' || w.id === 'wallet-receiver-2') || wallets[1] || wallets[0];
  const [selectedAsset, setSelectedAsset] = useState<AssetType>('USDT_TRC20');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');
  
  // Withdraw / Send from Binance state
  const [withdrawAsset, setWithdrawAsset] = useState<AssetType>('USDT_TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('5000');
  const [withdrawTargetWalletId, setWithdrawTargetWalletId] = useState<string>('wallet-receiver-1');
  const [withdrawCustomAddress, setWithdrawCustomAddress] = useState<string>('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Copy handler
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playAudioFeedback('click');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getAddress = (w: Wallet, asset: AssetType) => {
    if (asset === 'BTC') return w.addressBtc;
    if (asset === 'USDT_TRC20' || asset === 'TRX') return w.addressTron;
    return w.addressEth;
  };

  const currentAddress = getAddress(binanceWallet, selectedAsset);

  // Quick Top-up direct into Binance
  const handleDirectBinanceDeposit = (asset: AssetType, amount: number) => {
    onQuickMintAsset(asset, amount, binanceWallet.id, 300, `Direct Binance Flash Deposit`);
    playAudioFeedback('success');
    setDepositSuccessMsg(`+${amount} ${asset === 'USDT_TRC20' ? 'USDT' : asset} ${language === 'hi' ? 'बाइनेंस खाते में सफलतापूर्वक जमा हो गया!' : 'deposited to Binance successfully!'}`);
    setTimeout(() => setDepositSuccessMsg(null), 3500);
  };

  // Withdraw / Send from Binance to Any Other Wallet
  const handleWithdrawFromBinance = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (isNaN(num) || num <= 0) return;

    const targetW = wallets.find(w => w.id === withdrawTargetWalletId);
    const targetAddress = withdrawCustomAddress.trim() || (targetW ? getAddress(targetW, withdrawAsset) : 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');

    setIsProcessingWithdraw(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      onSendTransaction(
        binanceWallet.id,
        targetAddress,
        withdrawAsset,
        num,
        0.0001,
        targetW?.id
      );
      setIsProcessingWithdraw(false);
      setWithdrawSuccessMsg(
        language === 'hi'
          ? `बाइनेंस से ${num} ${withdrawAsset === 'USDT_TRC20' ? 'USDT' : withdrawAsset} का ट्रांसफर सफलतापूर्वक भेजा गया!`
          : `Successfully transferred ${num} ${withdrawAsset === 'USDT_TRC20' ? 'USDT' : withdrawAsset} from Binance!`
      );
      playAudioFeedback('success');
      setTimeout(() => setWithdrawSuccessMsg(null), 4000);
    }, 1200);
  };

  // Calculate total Binance balance in USD
  const totalBinanceUsd =
    (binanceWallet.balances.BTC * ASSET_CONFIGS.BTC.usdRate) +
    (binanceWallet.balances.USDT_TRC20 * ASSET_CONFIGS.USDT_TRC20.usdRate) +
    (binanceWallet.balances.TRX * ASSET_CONFIGS.TRX.usdRate) +
    (binanceWallet.balances.ETH * ASSET_CONFIGS.ETH.usdRate);

  // Filter Binance transactions
  const binanceTxs = transactions.filter(
    tx => tx.fromWalletId === binanceWallet.id || 
          tx.toWalletId === binanceWallet.id || 
          tx.toAddress === binanceWallet.addressBtc || 
          tx.toAddress === binanceWallet.addressTron ||
          tx.toAddress === binanceWallet.addressEth
  );

  return (
    <div className="space-y-6">
      
      {/* Binance Official Header Banner */}
      <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-slate-900 border-2 border-yellow-400/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-2.5 py-1 bg-yellow-400 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span>BINANCE</span>
                <span className="text-[10px] bg-slate-950 text-yellow-400 px-1.5 py-0.2 rounded font-mono">SPOT & FUNDING</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'hi' ? 'वेरिफाइड वीआईपी अकाउंट' : 'Verified VIP Account'}
              </span>
              <span className="text-xs font-mono text-yellow-400/80">UID: 894102941</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'बाइनेंस वॉलेट एवं एक्सचेंज हब' : 'Binance Wallet & Exchange Hub'}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {language === 'hi'
                ? 'यह आपका आधिकारिक बाइनेंस खाता है। यहाँ आप 300-दिन की फ्लैश क्रिप्टो जमा कर सकते हैं, बैलेंस देख सकते हैं, और किसी भी ट्रस्ट वॉलेट, मेटामास्क या कस्टम एड्रेस पर ट्रांसफर भेज सकते हैं।'
                : 'Your dedicated Binance Spot & Funding account with instant 300-day flash deposits, multi-network address generation, and 1-click transfers across all destinations.'}
            </p>
          </div>

          {/* Quick Balance Total */}
          <div className="bg-slate-950/80 border border-yellow-500/30 rounded-xl p-4 text-right min-w-[200px]">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              {language === 'hi' ? 'कुल बाइनेंस बैलेंस (USD)' : 'Total Binance Balance (USD)'}
            </span>
            <div className="text-2xl font-mono font-black text-yellow-400 mt-0.5">
              ${totalBinanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-emerald-400 mt-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% 300-Day Flash Ready</span>
            </div>
          </div>
        </div>

        {depositSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{depositSuccessMsg}</span>
          </div>
        )}

        {withdrawSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{withdrawSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 4 Asset Balances Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(['USDT_TRC20', 'BTC', 'TRX', 'ETH'] as AssetType[]).map((type) => {
          const cfg = ASSET_CONFIGS[type];
          const bal = binanceWallet.balances[type] || 0;
          const valUsd = bal * cfg.usdRate;
          const isSelected = selectedAsset === type;

          return (
            <div
              key={type}
              onClick={() => {
                setSelectedAsset(type);
                playAudioFeedback('click');
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-slate-900 border-yellow-400 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-500/10'
                  : 'bg-slate-950/80 border-slate-800 hover:border-yellow-500/40 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-yellow-400/15 text-yellow-400 font-bold text-xs flex items-center justify-center border border-yellow-400/30">
                    {cfg.symbol.slice(0, 3)}
                  </span>
                  <span className="font-bold text-sm text-white">{cfg.name}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {cfg.network}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-xl font-mono font-bold text-yellow-300">
                  {bal.toLocaleString('en-US', { maximumFractionDigits: 4 })} {cfg.symbol}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  ≈ ${valUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                </div>
              </div>

              {/* Quick Add Button inside asset card */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const amt = type === 'USDT_TRC20' ? 25000 : type === 'BTC' ? 1.0 : type === 'TRX' ? 100000 : 5.0;
                    handleDirectBinanceDeposit(type, amt);
                  }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 flex items-center gap-1 transition"
                >
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>+{type === 'USDT_TRC20' ? '25,000' : type === 'BTC' ? '1.0' : type === 'TRX' ? '100K' : '5.0'} {cfg.symbol}</span>
                </button>

                <span className="text-[10px] text-emerald-400 font-mono">300d Flash</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-Navigation: Overview & Deposit & Transfer/Withdraw */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => { setActiveSubTab('overview'); playAudioFeedback('click'); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-yellow-400 text-yellow-300 bg-yellow-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-yellow-400" />
          <span>{language === 'hi' ? '1. बाइनेंस डिपॉजिट और एड्रेस' : '1. Binance Deposit & Addresses'}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('withdraw'); playAudioFeedback('click'); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'withdraw'
              ? 'border-yellow-400 text-yellow-300 bg-yellow-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4 text-yellow-400" />
          <span>{language === 'hi' ? '2. बाइनेंस से अन्य वॉलेट में ट्रांसफर' : '2. Send from Binance to Any Wallet'}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('history'); playAudioFeedback('click'); }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'history'
              ? 'border-yellow-400 text-yellow-300 bg-yellow-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>{language === 'hi' ? '3. बाइनेंस ट्रांसफर हिस्ट्री' : '3. Binance History'}</span>
        </button>
      </div>

      {/* TAB 1: Binance Deposit & Addresses */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Official Binance Deposit Address & 1-Click Flash Mints */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{language === 'hi' ? 'बाइनेंस आधिकारिक डिपॉजिट एड्रेस' : 'Official Binance Deposit Address'}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                    {ASSET_CONFIGS[selectedAsset].network}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'hi'
                  ? 'इस पते पर भेजा गया कोई भी ट्रांसफर सीधे आपके बाइनेंस अकाउंट में 6/6 कन्फर्मेशन के साथ जमा हो जाता है।'
                  : 'Any flash crypto transferred to this address is credited directly into your Binance Spot balance.'}
              </p>
            </div>

            {/* Address Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">{ASSET_CONFIGS[selectedAsset].name} Deposit Address:</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Network Online
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700/80 font-mono text-xs sm:text-sm text-yellow-300 break-all select-all">
                <span>{currentAddress}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(currentAddress, 'dep-addr')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Copy Address"
                  >
                    {copiedKey === 'dep-addr' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onOpenQr(currentAddress, `Binance ${selectedAsset} Deposit Address`)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 transition"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Instant 1-Click Flash Injectors */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                {language === 'hi' ? '⚡ 1-क्लिक में बाइनेंस खाते में 300-दिन बैलेंस जोड़ें:' : '⚡ 1-Click Instant Flash Balance Injector:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectBinanceDeposit('USDT_TRC20', 50000)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-yellow-500/30 hover:border-yellow-400 rounded-xl text-left transition group"
                >
                  <span className="text-[10px] text-slate-400 block">USDT (TRC-20)</span>
                  <span className="text-sm font-mono font-bold text-yellow-300 group-hover:text-yellow-200">+50,000 USDT</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">⚡ 300-Day Flash</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectBinanceDeposit('BTC', 2.5)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-yellow-500/30 hover:border-yellow-400 rounded-xl text-left transition group"
                >
                  <span className="text-[10px] text-slate-400 block">BITCOIN</span>
                  <span className="text-sm font-mono font-bold text-amber-300 group-hover:text-amber-200">+2.50 BTC</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">⚡ 300-Day Flash</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectBinanceDeposit('TRX', 250000)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-yellow-500/30 hover:border-yellow-400 rounded-xl text-left transition group"
                >
                  <span className="text-[10px] text-slate-400 block">TRON</span>
                  <span className="text-sm font-mono font-bold text-red-300 group-hover:text-red-200">+250,000 TRX</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">⚡ 300-Day Flash</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectBinanceDeposit('ETH', 10.0)}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-yellow-500/30 hover:border-yellow-400 rounded-xl text-left transition group"
                >
                  <span className="text-[10px] text-slate-400 block">ETHEREUM</span>
                  <span className="text-sm font-mono font-bold text-purple-300 group-hover:text-purple-200">+10.0 ETH</span>
                  <span className="text-[9px] text-emerald-400 block mt-0.5">⚡ 300-Day Flash</span>
                </button>
              </div>
            </div>

            {/* Jump to P2P Transfer */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onSelectWallet(binanceWallet.id);
                  onNavigateTab('transfer');
                }}
                className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'hi' ? '🚀 ट्रांसफर इंजन में बाइनेंस से भेजें' : '🚀 Open P2P Transfer Engine'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('generator')}
                className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'फ्लैश जनरेटर खोलें' : 'Open Flash Generator'}</span>
              </button>
            </div>
          </div>

          {/* Right 1 Col: Binance Account Verification Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'बाइनेंस खाता विवरण' : 'Binance Account Specs'}</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-mono font-bold text-yellow-400">Enterprise VIP 3</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">KYC Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Validity Lock:</span>
                <span className="font-mono font-bold text-amber-300">300 Days (OP_CLTV)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Confirmations:</span>
                <span className="font-mono font-bold text-cyan-300">6/6 Instant Broadcast</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Supported Networks:</span>
                <span className="font-mono text-slate-200">TRC-20, BTC, ERC-20</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-xs space-y-1">
              <span className="font-bold text-yellow-300 block">💡 100% Transfer Guarantee:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {language === 'hi'
                  ? 'सभी ट्रांसफर सभी ट्रस्ट वॉलेट, मेटामास्क, लेज़र, और निजी वॉलेट्स में बिना किसी रुकावट के मान्य हैं।'
                  : 'All transfers broadcasted to or from Binance are fully recognized and synced across all destination wallets.'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Send from Binance to Any Wallet */}
      {activeSubTab === 'withdraw' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-yellow-400" />
              <span>{language === 'hi' ? 'बाइनेंस से सभी जगह ट्रांसफर करें (Universal Transfer)' : 'Universal Transfer from Binance to Any Wallet'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'hi'
                ? 'अपने बाइनेंस खाते से ट्रस्ट वॉलेट, मेटामास्क, लेज़र, या किसी भी कस्टम क्रिप्टो एड्रेस पर ट्रांसफर भेजें।'
                : 'Send 300-day flash cryptocurrency from your Binance account to Trust Wallet, MetaMask, Ledger, or any external address.'}
            </p>
          </div>

          <form onSubmit={handleWithdrawFromBinance} className="space-y-4">
            
            {/* Asset Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                1. {language === 'hi' ? 'ट्रांसफर करने के लिए क्रिप्टो एसेट' : 'Cryptocurrency to Transfer'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['USDT_TRC20', 'BTC', 'TRX', 'ETH'] as AssetType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setWithdrawAsset(type); playAudioFeedback('click'); }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-bold transition ${
                      withdrawAsset === type
                        ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>{type === 'USDT_TRC20' ? 'USDT (TRC-20)' : type}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      Avail: {binanceWallet.balances[type]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Amount */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. {language === 'hi' ? 'ट्रांसफर राशि (Amount)' : 'Transfer Amount'}
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {language === 'hi' ? 'बाइनेंस उपलब्ध:' : 'Binance Balance:'}{' '}
                  <strong className="text-yellow-400">{binanceWallet.balances[withdrawAsset]} {ASSET_CONFIGS[withdrawAsset].symbol}</strong>
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.000001"
                  max={binanceWallet.balances[withdrawAsset] || 1000000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white outline-none focus:border-yellow-400"
                  placeholder="0.00"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawAmount(((binanceWallet.balances[withdrawAsset] || 0) * 0.5).toString());
                      playAudioFeedback('click');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawAmount((binanceWallet.balances[withdrawAsset] || 0).toString());
                      playAudioFeedback('click');
                    }}
                    className="px-2 py-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 text-[10px] font-bold rounded border border-yellow-400/40"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Target */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                3. {language === 'hi' ? 'प्राप्तकर्ता चुनें (Target Destination)' : 'Select Target Destination'}
              </label>

              {/* Quick Destination Chips */}
              <div className="flex flex-wrap gap-2 mb-2">
                {wallets
                  .filter(w => w.id !== binanceWallet.id)
                  .map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setWithdrawTargetWalletId(w.id);
                        setWithdrawCustomAddress('');
                        playAudioFeedback('click');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        withdrawTargetWalletId === w.id && !withdrawCustomAddress
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>{language === 'hi' ? w.nameHi : w.name}</span>
                    </button>
                  ))}
              </div>

              {/* Or Custom Address */}
              <input
                type="text"
                value={withdrawCustomAddress}
                onChange={(e) => setWithdrawCustomAddress(e.target.value)}
                placeholder={language === 'hi' ? 'या कोई भी कस्टम बिटकॉइन/TRC-20/ETH एड्रेस पेस्ट करें' : 'Or paste any custom Bitcoin/TRC-20/ETH address'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-yellow-400"
              />
            </div>

            {/* Submit Transfer */}
            <button
              type="submit"
              disabled={isProcessingWithdraw || (binanceWallet.balances[withdrawAsset] || 0) <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                isProcessingWithdraw || (binanceWallet.balances[withdrawAsset] || 0) <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-500/20'
              }`}
            >
              {isProcessingWithdraw ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'hi' ? 'ब्लॉकचेन पर ब्रॉडकास्ट हो रहा है...' : 'Broadcasting from Binance...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'hi' ? '🚀 बाइनेंस से ट्रांसफर ब्रॉडकास्ट करें' : '🚀 Broadcast Transfer from Binance'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: History */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>{language === 'hi' ? 'बाइनेंस लेनदेन का इतिहास (6/6 कन्फर्मेशन)' : 'Binance Transactions Log (6/6 Confirmations)'}</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{binanceTxs.length} Transactions</span>
          </div>

          {binanceTxs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {language === 'hi' ? 'अभी कोई लेनदेन नहीं है। ऊपर दिए गए बटन से तुरंत बैलेंस जोड़ें या ट्रांसफर करें।' : 'No Binance transactions yet. Use the buttons above to deposit or transfer.'}
            </div>
          ) : (
            <div className="space-y-2">
              {binanceTxs.map((tx) => {
                const isIncoming = tx.toWalletId === binanceWallet.id || tx.toAddress === binanceWallet.addressBtc || tx.toAddress === binanceWallet.addressTron || tx.toAddress === binanceWallet.addressEth;
                return (
                  <div key={tx.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${isIncoming ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-white block">
                          {isIncoming ? (language === 'hi' ? 'बाइनेंस डिपॉजिट (Incoming)' : 'Binance Deposit') : (language === 'hi' ? 'बाइनेंस विथड्रॉल / ट्रांसफर (Sent)' : 'Binance Transfer')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          TXID: {truncateHash(tx.txid)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm ${isIncoming ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {isIncoming ? '+' : '-'}{tx.amount} {tx.assetType === 'USDT_TRC20' ? 'USDT' : tx.assetType}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 block">
                        ✓ 6/6 Confirmed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
