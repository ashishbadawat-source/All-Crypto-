import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../data/translations';
import { ShieldCheck, User as UserIcon, Mail, KeyRound, Copy, Check, Lock, LogOut, CheckCircle2, X } from 'lucide-react';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface UserProfileModalProps {
  user: User;
  language: Language;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (updated: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  language,
  onClose,
  onLogout,
  onUpdateUser
}) => {
  const t = translations[language];

  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [is2FA, setIs2FA] = useState(user.is2FAEnabled);

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(user.mnemonic);
    setCopiedMnemonic(true);
    playAudioFeedback('click');
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  const handleToggle2FA = () => {
    const newVal = !is2FA;
    setIs2FA(newVal);
    onUpdateUser({ ...user, is2FAEnabled: newVal });
    playAudioFeedback('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-slate-950 uppercase shadow-md">
            {user.name.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{user.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t.authKycVerified}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          </div>
        </div>

        {/* Security & Account Details */}
        <div className="space-y-3 text-xs">
          
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{language === 'hi' ? 'सुरक्षा स्थिति:' : 'Security State:'}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {language === 'hi' ? 'पूर्ण एन्क्रिप्टेड वॉल्ट' : 'Encrypted Vault'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">{language === 'hi' ? 'टू-फैक्टर ऑथेंटिकेशन (2FA):' : '2-Factor Auth (2FA):'}</span>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-2.5 py-0.5 rounded font-mono font-bold transition ${
                  is2FA
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {is2FA ? 'ENABLED (ON)' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* 12-Word Seed Phrase Viewer */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {language === 'hi' ? '12-शब्दों की रिकवरी की' : '12-Word Recovery Seed'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSeed(!showSeed)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                >
                  {showSeed ? (language === 'hi' ? 'छुपाएं' : 'Hide') : (language === 'hi' ? 'दिखाएं' : 'Reveal')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyMnemonic}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                  title="Copy Seed"
                >
                  {copiedMnemonic ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {showSeed ? (
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px] bg-slate-900 p-2 rounded-lg border border-slate-800 text-amber-300">
                {user.mnemonic.split(' ').map((w, idx) => (
                  <div key={idx} className="bg-slate-950 px-1 py-0.5 rounded">
                    <span className="text-slate-500 mr-1">{idx + 1}.</span>{w}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-slate-900 rounded-lg text-[11px] text-slate-500 text-center font-mono">
                •••• •••• •••• •••• •••• •••• •••• ••••
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.authLogout}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
