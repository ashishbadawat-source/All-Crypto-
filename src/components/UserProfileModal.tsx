import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../data/translations';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  KeyRound,
  Copy,
  Check,
  Lock,
  LogOut,
  CheckCircle2,
  X,
  Users,
  UserPlus,
  RefreshCw,
  Key,
  Shield,
  Activity,
  Calendar
} from 'lucide-react';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface UserProfileModalProps {
  user: User;
  language: Language;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (updated: User) => void;
  onOpenSwitchAccount?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  language,
  onClose,
  onLogout,
  onUpdateUser,
  onOpenSwitchAccount
}) => {
  const t = translations[language];

  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [is2FA, setIs2FA] = useState(user.is2FAEnabled);

  // Edit PIN state
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState(user.pin || '1234');
  const [pinSaved, setPinSaved] = useState(false);

  // Edit Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(user.name);

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(user.mnemonic);
    setCopiedMnemonic(true);
    playAudioFeedback('click');
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedUserId(true);
    playAudioFeedback('click');
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  const handleToggle2FA = () => {
    const newVal = !is2FA;
    setIs2FA(newVal);
    onUpdateUser({ ...user, is2FAEnabled: newVal });
    playAudioFeedback('success');
  };

  const handleSavePin = () => {
    if (newPin.length >= 4) {
      onUpdateUser({ ...user, pin: newPin });
      setIsEditingPin(false);
      setPinSaved(true);
      playAudioFeedback('success');
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  const handleSaveName = () => {
    if (nameVal.trim()) {
      onUpdateUser({ ...user, name: nameVal.trim() });
      setIsEditingName(false);
      playAudioFeedback('success');
    }
  };

  const formattedCreatedDate = new Date(user.createdAt || Date.now()).toLocaleDateString(
    language === 'hi' ? 'hi-IN' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-fadeIn relative my-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Top Banner */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-xl text-amber-400 uppercase">
              {user.name.slice(0, 2)}
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameVal}
                    onChange={(e) => setNameVal(e.target.value)}
                    className="bg-slate-950 border border-amber-400/80 rounded px-2 py-0.5 text-xs text-white outline-none font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-base text-white truncate">{user.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Tier-{user.kycTier || 2} KYC Verified
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                VIP Access
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Security & Access Information */}
        <div className="space-y-2.5 text-xs">
          
          {/* User ID & Registration Details */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-sans">{language === 'hi' ? 'यूजर ID:' : 'User ID:'}</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span>{user.id}</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  className="text-slate-400 hover:text-white"
                  title="Copy User ID"
                >
                  {copiedUserId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
              <span className="text-slate-400 font-sans">{language === 'hi' ? 'रजिस्ट्रेशन तारीख:' : 'Member Since:'}</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                {formattedCreatedDate}
              </span>
            </div>
          </div>

          {/* Security PIN & 2FA Management */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'टू-फैक्टर ऑथेंटिकेशन (2FA)' : '2-Factor Auth (2FA)'}</span>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  is2FA
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {is2FA ? 'ACTIVE (ON)' : 'DISABLED'}
              </button>
            </div>

            {/* 4-Digit Security PIN */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <div className="flex items-center gap-1.5 text-slate-300">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'सुरक्षा पिन (4-अंक)' : 'Security PIN'}</span>
              </div>

              {isEditingPin ? (
                <div className="flex items-center gap-1">
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-16 bg-slate-900 border border-amber-400 rounded px-2 py-0.5 text-xs font-mono text-center text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSavePin}
                    className="px-2 py-0.5 bg-amber-500 text-slate-950 text-xs font-bold rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">••••</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPin(true)}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline"
                  >
                    {language === 'hi' ? 'बदलें' : 'Change'}
                  </button>
                  {pinSaved && <span className="text-[10px] text-emerald-400">Saved!</span>}
                </div>
              )}
            </div>

          </div>

          {/* 12-Word Seed Phrase Viewer */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-bold uppercase text-slate-300">
                  {language === 'hi' ? '12-शब्दों की रिकवरी की' : '12-Word Secret Recovery Key'}
                </span>
              </div>
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
                  <div key={idx} className="bg-slate-950 px-1 py-0.5 rounded truncate">
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
        <div className="space-y-2 pt-1">
          
          {/* Switch Account or Add New Account */}
          {onOpenSwitchAccount && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSwitchAccount();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'खाता बदलें या नया खाता जोड़ें' : 'Switch / Add Another Account'}</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.authLogout}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
