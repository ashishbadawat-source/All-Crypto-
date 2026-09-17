import React from 'react';
import { ShieldCheck, Globe, RefreshCw, Zap, Clock, Activity, User as UserIcon, LogIn, UserPlus, CheckCircle2, Wallet, Users } from 'lucide-react';
import { Language, User, AuthMode } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  blockHeight: number;
  simulatedDays: number;
  onReset: () => void;
  currentUser: User | null;
  onOpenAuth: (initialMode?: AuthMode) => void;
  onOpenProfile: () => void;
  connectedWeb3Wallet: string | null;
  onOpenWeb3Connect: () => void;
  onOpenBinance?: () => void;
  binanceBalanceUsd?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  blockHeight,
  simulatedDays,
  onReset,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  connectedWeb3Wallet,
  onOpenWeb3Connect,
  onOpenBinance,
  binanceBalanceUsd
}) => {
  const t = translations[language];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-amber-400">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>{t.appTitle}</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                MAINNET V5.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Network, Web3, Binance, User & Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          
          {/* Binance Direct Button in Header */}
          {onOpenBinance && (
            <button
              id="header-binance-btn"
              onClick={onOpenBinance}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 border border-yellow-400/40 shadow-sm transition"
              title="Open Binance Exchange & Wallet Hub"
            >
              <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 rounded text-[9px] font-black">BINANCE</span>
              <span className="font-mono text-[11px]">
                ${(binanceBalanceUsd || 89500).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </button>
          )}

          {/* Node sync badge */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">{t.blockHeight}:</span>
            <span className="font-mono font-bold text-slate-200 text-[11px]">#{blockHeight.toLocaleString()}</span>
          </div>

          {/* 300-day TTL badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-[11px]">300-DAY TIMELOCK</span>
            {simulatedDays > 0 && (
              <span className="text-slate-400 font-mono text-[10px]">({simulatedDays}d)</span>
            )}
          </div>

          {/* Web3 Connect Wallet Button */}
          <button
            id="web3-connect-btn"
            onClick={onOpenWeb3Connect}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              connectedWeb3Wallet
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="truncate max-w-[110px]">
              {connectedWeb3Wallet ? `🟢 ${connectedWeb3Wallet}` : (language === 'hi' ? 'Web3 वॉलेट' : 'Connect Web3')}
            </span>
          </button>

          {/* User Auth Profile & Registration Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                id="user-profile-btn"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 text-[10px] font-bold flex items-center justify-center uppercase">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[90px] sm:max-w-[120px] text-[11px] font-bold">{currentUser.name}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">Tier-{currentUser.kycTier || 2} KYC</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'लॉगिन' : 'Sign In'}</span>
              </button>

              <button
                id="header-register-btn"
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'रजिस्टर' : 'Register'}</span>
              </button>
            </div>
          )}

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => onLanguageChange(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">{language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Reset State */}
          <button
            id="reset-sandbox-btn"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition"
            title="Reset Sandbox Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
