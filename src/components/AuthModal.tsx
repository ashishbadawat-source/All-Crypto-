import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Copy,
  AlertCircle,
  ArrowRight,
  Zap,
  RefreshCw,
  X,
  UserPlus,
  LogIn,
  FileKey,
  Users,
  Award,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Language, User, AuthMode } from '../types';
import { translations } from '../data/translations';
import { generateMnemonic, playAudioFeedback } from '../utils/cryptoUtils';
import { DEFAULT_DEMO_USERS } from '../data/constants';

interface AuthModalProps {
  isOpen: boolean;
  language: Language;
  initialMode?: AuthMode;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  isDismissable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  language,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  isDismissable = true
}) => {
  const t = translations[language];

  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [usePinLogin, setUsePinLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regPin, setRegPin] = useState('1234');
  const [kycTier, setKycTier] = useState<number>(2);
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);

  // Mnemonic login field
  const [inputMnemonic, setInputMnemonic] = useState('');

  // Stored users list for Quick Access
  const [storedUsers, setStoredUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem('flash_crypto_registered_users');
      return raw ? JSON.parse(raw) : DEFAULT_DEMO_USERS;
    } catch {
      return DEFAULT_DEMO_USERS;
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When switching to register, ensure fresh mnemonic is generated
  const handleSwitchTab = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (newMode === 'register' && !generatedMnemonic) {
      setGeneratedMnemonic(generateMnemonic());
      setMnemonicConfirmed(false);
    }
    playAudioFeedback('click');
  };

  const handleGenerateNewMnemonic = () => {
    setGeneratedMnemonic(generateMnemonic());
    setMnemonicConfirmed(false);
    playAudioFeedback('click');
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(generatedMnemonic);
    setCopiedMnemonic(true);
    playAudioFeedback('click');
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  // Quick 1-click select account from saved list
  const handleSelectUser = (user: User) => {
    setIsLoading(true);
    playAudioFeedback('broadcast');
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        lastLoginAt: Date.now()
      };
      // update in stored users
      const updatedList = storedUsers.map(u => u.id === user.id ? updatedUser : u);
      setStoredUsers(updatedList);
      localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updatedList));
      localStorage.setItem('flash_crypto_active_user', JSON.stringify(updatedUser));
      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess(updatedUser);
    }, 500);
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storedUsers.filter(u => u.id !== userId);
    setStoredUsers(updated);
    localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updated));
    playAudioFeedback('click');
  };

  // Submit Login Form
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल पता दर्ज करें' : 'Please enter email address');
      return;
    }

    if (!usePinLogin && !password) {
      setErrorMessage(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter password');
      return;
    }

    if (usePinLogin && !loginPin) {
      setErrorMessage(language === 'hi' ? 'कृपया 4-अंकों का सुरक्षा पिन दर्ज करें' : 'Please enter 4-digit security PIN');
      return;
    }

    setIsLoading(true);
    playAudioFeedback('click');

    setTimeout(() => {
      // Find matching user by email
      const matched = storedUsers.find(
        u => u.email.toLowerCase() === cleanEmail.toLowerCase()
      );

      if (matched) {
        if (usePinLogin && matched.pin && matched.pin !== loginPin) {
          setIsLoading(false);
          setErrorMessage(language === 'hi' ? 'अमान्य सुरक्षा पिन!' : 'Invalid Security PIN!');
          playAudioFeedback('expire');
          return;
        }

        const activeUser: User = {
          ...matched,
          lastLoginAt: Date.now()
        };

        const updatedList = storedUsers.map(u => u.id === matched.id ? activeUser : u);
        setStoredUsers(updatedList);
        localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updatedList));
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(activeUser));

        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(activeUser);
      } else {
        // Auto-provision user account for instant sandbox onboarding
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0] || 'Trader',
          email: cleanEmail,
          pin: loginPin || '1234',
          mnemonic: generateMnemonic(),
          kycTier: 2,
          is2FAEnabled: true,
          avatarSeed: cleanEmail,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };

        const updatedList = [...storedUsers, newUser];
        setStoredUsers(updatedList);
        localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updatedList));
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(newUser));

        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(newUser);
      }
    }, 600);
  };

  // Submit Registration Form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName || !cleanEmail || !regPassword) {
      setErrorMessage(language === 'hi' ? 'कृपया सभी अनिवार्य फ़ील्ड भरें' : 'Please fill all required fields');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters');
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords do not match');
      return;
    }

    if (!mnemonicConfirmed) {
      setErrorMessage(language === 'hi' ? 'कृपया 12-शब्दों की रिकवरी की सुरक्षित होने की पुष्टि करें' : 'Please check the box confirming you saved your 12-word seed phrase');
      return;
    }

    setIsLoading(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        pin: regPin || '1234',
        mnemonic: generatedMnemonic || generateMnemonic(),
        kycTier: kycTier,
        is2FAEnabled: true,
        avatarSeed: cleanName,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      const updatedList = [...storedUsers.filter(u => u.email.toLowerCase() !== cleanEmail.toLowerCase()), newUser];
      setStoredUsers(updatedList);
      localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updatedList));
      localStorage.setItem('flash_crypto_active_user', JSON.stringify(newUser));

      setIsLoading(false);
      playAudioFeedback('success');
      setSuccessMessage(language === 'hi' ? 'अकाउंट सफलतापूर्वक पंजीकृत हुआ!' : 'Account registered successfully!');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 400);
    }, 700);
  };

  // Submit 12-Word Seed Login Form
  const handleMnemonicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const words = inputMnemonic.trim().split(/\s+/).filter(Boolean);
    if (words.length < 12) {
      setErrorMessage(
        language === 'hi'
          ? `कृपया पूरे 12 शब्द दर्ज करें (वर्तमान: ${words.length} शब्द)`
          : `Please enter all 12 words (currently: ${words.length} words)`
      );
      return;
    }

    setIsLoading(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      // Check if matches an existing user's mnemonic
      const cleanInput = words.join(' ').toLowerCase();
      const existing = storedUsers.find(u => u.mnemonic.toLowerCase() === cleanInput);

      if (existing) {
        const activeUser: User = { ...existing, lastLoginAt: Date.now() };
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(activeUser));
        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(activeUser);
      } else {
        const userFromSeed: User = {
          id: `user-seed-${Date.now()}`,
          name: `Vault-${words[0].toUpperCase()}`,
          email: `${words[0].toLowerCase()}@crypto.sandbox`,
          pin: '1234',
          mnemonic: words.join(' '),
          kycTier: 2,
          is2FAEnabled: true,
          avatarSeed: words[0],
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };

        const updatedList = [...storedUsers, userFromSeed];
        setStoredUsers(updatedList);
        localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updatedList));
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(userFromSeed));

        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(userFromSeed);
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-fadeIn relative my-6 text-slate-100">
        
        {/* Close button */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Top Branding */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 mx-auto shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {language === 'hi' ? 'यूजर रजिस्ट्रेशन & ऑथेंटिकेशन एक्सेस' : 'User Registration & Access Center'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'फ्लैश क्रिप्टो सैंडबॉक्स और 300-दिन वॉलेट वॉल्ट में सुरक्षित प्रवेश'
              : 'Secure credentials for 300-Day Flash Crypto Terminal & Wallets'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
          
          {/* Tab 1: Login */}
          <button
            type="button"
            onClick={() => handleSwitchTab('login')}
            className={`py-2 px-1 sm:px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'hi' ? 'लॉगिन' : 'Sign In'}</span>
          </button>

          {/* Tab 2: Register */}
          <button
            type="button"
            onClick={() => handleSwitchTab('register')}
            className={`py-2 px-1 sm:px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'hi' ? 'रजिस्टर' : 'Sign Up'}</span>
          </button>

          {/* Tab 3: Seed Login */}
          <button
            type="button"
            onClick={() => handleSwitchTab('mnemonic_login')}
            className={`py-2 px-1 sm:px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'mnemonic_login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileKey className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'hi' ? 'सीड की' : 'Seed'}</span>
          </button>

          {/* Tab 4: Saved Accounts */}
          <button
            type="button"
            onClick={() => handleSwitchTab('saved_accounts')}
            className={`py-2 px-1 sm:px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              mode === 'saved_accounts'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {language === 'hi' ? `खाते (${storedUsers.length})` : `Users (${storedUsers.length})`}
            </span>
          </button>

        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ---------------- 1. LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Quick Demo 1-Click Login Bar */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {language === 'hi' ? '⚡ त्वरित 1-क्लिक एक्सेस प्रोफाइल्स:' : '⚡ Quick 1-Click Access Profiles:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {storedUsers.slice(0, 2).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-900 text-left transition flex items-center gap-2.5 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                      {user.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {language === 'hi' ? 'या ईमेल/पिन से लॉगिन करें' : 'Or Login with Credentials'}
              </span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authEmail}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ashishbadawat@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password vs 4-Digit PIN Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {usePinLogin ? (language === 'hi' ? '4-अंकों का सुरक्षा पिन' : '4-Digit Security PIN') : t.authPassword}
                </label>
                <button
                  type="button"
                  onClick={() => setUsePinLogin(!usePinLogin)}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  {usePinLogin
                    ? (language === 'hi' ? 'पासवर्ड का उपयोग करें' : 'Use Password')
                    : (language === 'hi' ? 'सुरक्षा पिन का उपयोग करें' : 'Use Security PIN')}
                </button>
              </div>

              {usePinLogin ? (
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono tracking-widest text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t.authSignInButton}</span>
                </>
              )}
            </button>

            {/* Bottom helpers */}
            <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
              <button
                type="button"
                onClick={() => handleSwitchTab('mnemonic_login')}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                {t.authSeedLogin}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className="text-amber-400 font-bold hover:underline text-[11px]"
              >
                {language === 'hi' ? '+ नया अकाउंट बनाएं' : '+ Create New Account'}
              </button>
            </div>

          </form>
        )}

        {/* ---------------- 2. REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authName} <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ashish Badawat"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authEmail} <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ashishbadawat@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Passwords and PIN in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t.authPassword} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t.authConfirmPassword} <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t.authPin}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="1234"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-center text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            {/* KYC Tier Selector */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-bold uppercase text-slate-400">
                {language === 'hi' ? 'केवाईसी वेरिफिकेशन टियर (KYC Tier):' : 'KYC Verification Tier:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { tier: 1, label: 'Tier 1: Basic', limit: '$10k/Day' },
                  { tier: 2, label: 'Tier 2: Verified', limit: '$100k/Day' },
                  { tier: 3, label: 'Tier 3: Pro VIP', limit: 'Unlimited' },
                ].map((item) => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setKycTier(item.tier)}
                    className={`p-1.5 rounded-lg border text-center transition ${
                      kycTier === item.tier
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px]">{item.label}</div>
                    <div className="text-[9px] font-mono text-slate-500">{item.limit}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated 12-Word Seed Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-amber-400">
                    {language === 'hi' ? '12-शब्दों की सीक्रेट रिकवरी की (BIP-39)' : '12-Word Secret Recovery Key (BIP-39)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateNewMnemonic}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    title="Generate New Seed"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyMnemonic}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedMnemonic ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMnemonic ? t.authSeedCopied : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                {(generatedMnemonic || generateMnemonic()).split(' ').map((w, idx) => (
                  <div key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 truncate">
                    <span className="text-slate-500 mr-1">{idx + 1}.</span>
                    {w}
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mnemonicConfirmed}
                  onChange={(e) => setMnemonicConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 accent-emerald-400"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  {language === 'hi'
                    ? 'मैंने इस 12-शब्दों की सीक्रेट रिकवरी फ्रेज को ऑफलाइन सुरक्षित नोट कर लिया है।'
                    : 'I have safely backed up my 12-word recovery seed phrase in offline storage.'}
                </span>
              </label>
            </div>

            {/* Submit Register */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t.authSignUpButton}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              <span>{t.authHaveAccount} </span>
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
              >
                {t.authLogin}
              </button>
            </div>

          </form>
        )}

        {/* ---------------- 3. MNEMONIC / SEED LOGIN MODE ---------------- */}
        {mode === 'mnemonic_login' && (
          <form onSubmit={handleMnemonicSubmit} className="space-y-4">
            
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-xs text-cyan-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <FileKey className="w-4 h-4 text-cyan-400" />
                <span>{language === 'hi' ? 'सीड फ्रेज से विकेंद्रीकृत लॉगिन' : 'Decentralized Seed Phrase Vault Restore'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'अपने 12-शब्दों के प्राइवेट रिकवरी सीक्रेट फ्रेज को दर्ज करके किसी भी डिवाइस पर अपना अकाउंट तुरंत रिस्टोर करें।'
                  : 'Enter your 12-word mnemonic phrase to cryptographically unlock and restore your simulated assets.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authSeedTitle}
              </label>
              <textarea
                value={inputMnemonic}
                onChange={(e) => setInputMnemonic(e.target.value)}
                placeholder="orbit galaxy quantum matrix nebula cipher crystal rocket vector echo phantom beacon"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-400 outline-none"
                required
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                <span>{language === 'hi' ? '12 शब्द स्पेस देकर लिखें' : '12 words separated by spaces'}</span>
                <span className="font-mono text-cyan-400">
                  {inputMnemonic.trim().split(/\s+/).filter(Boolean).length} / 12 words
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सीड फ्रेज से अकाउंट अनलॉक करें' : 'Restore & Unlock Account'}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-amber-400 hover:text-amber-300 font-medium underline"
              >
                ← {language === 'hi' ? 'ईमेल और पासवर्ड लॉगिन पर वापस जाएं' : 'Back to Email Login'}
              </button>
            </div>

          </form>
        )}

        {/* ---------------- 4. SAVED ACCOUNTS MANAGER ---------------- */}
        {mode === 'saved_accounts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {language === 'hi' ? 'डिवाइस पर पंजीकृत सभी खाते:' : 'All Saved Accounts on this Device:'}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? '+ नया जोड़ें' : '+ Add User'}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {storedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-400/80 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0 shadow">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white group-hover:text-amber-300 truncate">
                          {user.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Tier {user.kycTier || 2}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition flex items-center gap-1"
                    >
                      <span>{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {storedUsers.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteUser(user.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 transition"
                        title="Remove user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
                className="text-slate-400 hover:text-white underline"
              >
                ← {language === 'hi' ? 'लॉगिन स्क्रीन' : 'Back to Login'}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTab('register')}
                className="text-amber-400 font-bold hover:underline"
              >
                {language === 'hi' ? 'नया यूजर रजिस्टर करें →' : 'Register New User →'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
