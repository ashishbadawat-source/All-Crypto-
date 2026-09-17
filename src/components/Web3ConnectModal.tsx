import React, { useState } from 'react';
import { Wallet, ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, X, RefreshCw, Smartphone, KeyRound } from 'lucide-react';
import { Language } from '../types';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface Web3ConnectModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onConnectWallet: (walletName: string) => void;
}

interface WalletOption {
  id: string;
  name: string;
  type: string;
  badge?: string;
  color: string;
  iconBg: string;
}

export const Web3ConnectModal: React.FC<Web3ConnectModalProps> = ({
  isOpen,
  language,
  onClose,
  onConnectWallet
}) => {
  const [connectingId, setConnectingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const walletList: WalletOption[] = [
    { id: 'tronlink', name: 'TronLink Wallet', type: 'TRC-20 Native', badge: 'POPULAR FOR USDT', color: 'text-red-400', iconBg: 'bg-red-500/20' },
    { id: 'metamask', name: 'MetaMask', type: 'EVM / Multi-Chain', badge: 'INSTALLED', color: 'text-amber-400', iconBg: 'bg-amber-500/20' },
    { id: 'trustwallet', name: 'Trust Wallet', type: 'Mobile & Browser', color: 'text-blue-400', iconBg: 'bg-blue-500/20' },
    { id: 'okx', name: 'OKX Web3 Wallet', type: 'Multi-Chain DEX', color: 'text-slate-100', iconBg: 'bg-slate-700' },
    { id: 'ledger', name: 'Ledger Hardware', type: 'Cold Storage Vault', badge: 'ULTRA SAFE', color: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    { id: 'coinbase', name: 'Coinbase Wallet', type: 'Self-Custody', color: 'text-indigo-400', iconBg: 'bg-indigo-500/20' },
  ];

  const handleSelect = (wallet: WalletOption) => {
    setConnectingId(wallet.id);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      setConnectingId(null);
      playAudioFeedback('success');
      onConnectWallet(wallet.name);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 mx-auto shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 font-bold">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {language === 'hi' ? 'Web3 क्रिप्टो वॉलेट कनेक्ट करें' : 'Connect Web3 Crypto Wallet'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'TronLink, MetaMask या Trust Wallet को सुरक्षित रूप से कनेक्ट करें'
              : 'Select your preferred Web3 provider to interact with the vault'}
          </p>
        </div>

        {/* Wallets List */}
        <div className="space-y-2">
          {walletList.map(w => (
            <button
              key={w.id}
              onClick={() => handleSelect(w)}
              disabled={connectingId !== null}
              className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${w.iconBg} flex items-center justify-center font-bold text-sm ${w.color}`}>
                  {w.name.slice(0, 1)}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                      {w.name}
                    </span>
                    {w.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{w.type}</span>
                </div>
              </div>

              <div>
                {connectingId === w.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'hi'
              ? 'एन्क्रिप्टेड P2P कनेक्शन • किसी भी प्राइवेट की को शेयर नहीं किया जाता।'
              : 'End-to-End Cryptographic Handshake • Non-custodial connection.'}
          </span>
        </div>

      </div>
    </div>
  );
};
