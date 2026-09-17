import React from 'react';
import { Bitcoin, DollarSign, Flame, Layers, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Wallet, Language, AssetType } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { calculateRemainingTime } from '../utils/cryptoUtils';

interface PortfolioOverviewProps {
  primaryWallet: Wallet;
  allWallets: Wallet[];
  language: Language;
  simulatedDays: number;
  initialExpiryTimestamp: number;
  onNavigateTab: (tab: string) => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  primaryWallet,
  allWallets,
  language,
  simulatedDays,
  initialExpiryTimestamp,
  onNavigateTab
}) => {
  const t = translations[language];

  // Calculate remaining time
  const timeData = calculateRemainingTime(initialExpiryTimestamp, simulatedDays);

  // Calculate total USD across all wallets
  const totalUsd = allWallets.reduce((acc, w) => {
    return (
      acc +
      (w.balances.BTC * ASSET_CONFIGS.BTC.usdRate) +
      (w.balances.USDT_TRC20 * ASSET_CONFIGS.USDT_TRC20.usdRate) +
      (w.balances.TRX * ASSET_CONFIGS.TRX.usdRate) +
      (w.balances.ETH * ASSET_CONFIGS.ETH.usdRate)
    );
  }, 0);

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'BTC':
        return <Bitcoin className="w-6 h-6 text-amber-400" />;
      case 'USDT_TRC20':
        return <DollarSign className="w-6 h-6 text-emerald-400" />;
      case 'TRX':
        return <Flame className="w-6 h-6 text-red-400" />;
      case 'ETH':
        return <Layers className="w-6 h-6 text-indigo-400" />;
    }
  };

  // Format expiration date
  const expiryDate = new Date(initialExpiryTimestamp);
  const formattedExpiry = expiryDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Expiry Banner if expired or warning */}
      {timeData.isExpired ? (
        <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-red-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-red-100 text-base">{t.expiredNotice}</h3>
              <p className="text-xs text-red-300/80">
                {language === 'hi'
                  ? '300 दिनों की समय सीमा समाप्त हो गई है। टाइम-लॉक प्रोटोकॉल के अनुसार सभी फ्लैश टोकन गायब हो चुके हैं।'
                  : 'The 300-day validity window has elapsed. As per time-lock protocol, simulated assets have been pruned from active ledger state.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('lifecycle')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition"
          >
            {language === 'hi' ? 'लाइफसाइकिल रीसेट करें' : 'Reset Timeline'}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/20 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            {/* Left: Total Value & Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {t.activeValidity}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'hi' ? 'सभी वॉलेट्स में ट्रांसफर करने योग्य' : 'Spendable Across All Wallets'}
                </span>
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                {t.totalPortfolio}
              </p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  USD Equivalent
                </span>
              </div>
            </div>

            {/* Right: 200-Day Countdown Box */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 min-w-[280px] sm:min-w-[340px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                  <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>{t.timeRemaining}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {t.expiresOn}: <span className="text-slate-200 font-mono">{formattedExpiry}</span>
                </span>
              </div>

              {/* Countdown Digits */}
              <div className="grid grid-cols-4 gap-2 text-center my-2.5">
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg py-1.5 px-1">
                  <div className="text-lg sm:text-xl font-mono font-bold text-amber-300">{timeData.days}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{language === 'hi' ? 'दिन' : 'Days'}</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg py-1.5 px-1">
                  <div className="text-lg sm:text-xl font-mono font-bold text-slate-200">{timeData.hours}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{language === 'hi' ? 'घंटे' : 'Hours'}</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg py-1.5 px-1">
                  <div className="text-lg sm:text-xl font-mono font-bold text-slate-200">{timeData.minutes}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{language === 'hi' ? 'मिनट' : 'Mins'}</div>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg py-1.5 px-1">
                  <div className="text-lg sm:text-xl font-mono font-bold text-slate-200">{timeData.seconds}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">{language === 'hi' ? 'सेकंड' : 'Secs'}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    timeData.percentageRemaining < 15
                      ? 'bg-red-500'
                      : timeData.percentageRemaining < 40
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                  }`}
                  style={{ width: `${timeData.percentageRemaining}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                <span>{timeData.percentageRemaining.toFixed(1)}% {language === 'hi' ? 'वैधता शेष' : 'Remaining'}</span>
                <button
                  onClick={() => onNavigateTab('lifecycle')}
                  className="text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  {language === 'hi' ? 'टाइम-ट्रैवल टेस्ट करें' : 'Simulate Decay'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Bitcoin BTC Card */}
        <div className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {getAssetIcon('BTC')}
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
              SegWit
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">{t.availableBtc}</p>
            <p className="text-xl font-mono font-bold text-white">
              {primaryWallet.balances.BTC.toFixed(4)} <span className="text-xs text-amber-400 font-sans">BTC</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              ≈ ${(primaryWallet.balances.BTC * ASSET_CONFIGS.BTC.usdRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* USDT TRC-20 Card */}
        <div className="bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              {getAssetIcon('USDT_TRC20')}
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
              TRC-20
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">{t.availableUsdt}</p>
            <p className="text-xl font-mono font-bold text-white">
              {primaryWallet.balances.USDT_TRC20.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-sans">USDT</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              ≈ ${primaryWallet.balances.USDT_TRC20.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* TRON TRX Card */}
        <div className="bg-slate-900/90 border border-red-500/20 hover:border-red-500/40 rounded-xl p-4 transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              {getAssetIcon('TRX')}
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-300">
              TRON Native
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">{t.availableTrx}</p>
            <p className="text-xl font-mono font-bold text-white">
              {primaryWallet.balances.TRX.toLocaleString('en-US')} <span className="text-xs text-red-400 font-sans">TRX</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              ≈ ${(primaryWallet.balances.TRX * ASSET_CONFIGS.TRX.usdRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Ethereum ETH Card */}
        <div className="bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              {getAssetIcon('ETH')}
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
              ERC-20
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Flash Ethereum (ETH)</p>
            <p className="text-xl font-mono font-bold text-white">
              {primaryWallet.balances.ETH.toFixed(2)} <span className="text-xs text-indigo-400 font-sans">ETH</span>
            </p>
            <p className="text-xs text-slate-400 font-mono">
              ≈ ${(primaryWallet.balances.ETH * ASSET_CONFIGS.ETH.usdRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => onNavigateTab('binance')}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-yellow-500/20 transition whitespace-nowrap"
        >
          <span>🟡 {language === 'hi' ? 'बाइनेंस हब' : 'Binance Hub'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigateTab('generator')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition whitespace-nowrap"
        >
          <span>{t.tabGenerator}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigateTab('transfer')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition whitespace-nowrap"
        >
          <span>{t.tabTransfer}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigateTab('wallets')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition whitespace-nowrap"
        >
          <span>{t.tabWallets}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigateTab('explorer')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition whitespace-nowrap"
        >
          <span>{t.tabExplorer}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
