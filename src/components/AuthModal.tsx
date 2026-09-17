import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User as UserIcon, KeyRound, Eye, EyeOff, Check, Copy, AlertCircle, ArrowRight, Zap, RefreshCw, X } from 'lucide-react';
import { Language, User, AuthMode } from '../types';
import { translations } from '../data/translations';
import { generateMnemonic, playAudioFeedback } from '../utils/cryptoUtils';
import { DEFAULT_DEMO_USERS } from '../data/constants';

interface AuthModalProps {
  isOpen: boolean;
  language: Language;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  isDismissable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  language,
  onClose,
  onLoginSuccess,
  isDismissable = true
}) => {
  const t = translations[language];

  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);

  // Mnemonic login field
  const [inputMnemonic, setInputMnemonic] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartRegister = () => {
    setMode('register');
    setGeneratedMnemonic(generateMnemonic());
    setMnemonicConfirmed(false);
    setErrorMessage(null);
    playAudioFeedback('click');
  };

  const handleStartLogin = () => {
    setMode('login');
    setErrorMessage(null);
    playAudioFeedback('click');
  };

  const handleStartMnemonicLogin = () => {
    setMode('mnemonic_login');
    setErrorMessage(null);
    playAudioFeedback('click');
  };

  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(generatedMnemonic);
    setCopiedMnemonic(true);
    playAudioFeedback('click');
    setTimeout(() => setCopiedMnemonic(false), 2000);
  };

  // Quick 1-click Demo Login
  const handleQuickDemo = () => {
    setIsLoading(true);
    playAudioFeedback('broadcast');
    setTimeout(() => {
      const demoUser = DEFAULT_DEMO_USERS[0];
      // Save active user to localStorage
      localStorage.setItem('flash_crypto_active_user', JSON.stringify(demoUser));
      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess(demoUser);
    }, 600);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दर्ज करें' : 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    playAudioFeedback('click');

    setTimeout(() => {
      // Check stored users in localStorage
      const storedUsersRaw = localStorage.getItem('flash_crypto_registered_users');
      const registeredUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : DEFAULT_DEMO_USERS;

      const matched = registeredUsers.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matched) {
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(matched));
        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(matched);
      } else {
        // Create user automatically for sandbox convenience if not found
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0] || 'Vault User',
          email: email.trim(),
          pin: '1234',
          mnemonic: generateMnemonic(),
          kycTier: 2,
          is2FAEnabled: true,
          avatarSeed: email,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        const updated = [...registeredUsers, newUser];
        localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updated));
        localStorage.setItem('flash_crypto_active_user', JSON.stringify(newUser));
        setIsLoading(false);
        playAudioFeedback('success');
        onLoginSuccess(newUser);
      }
    }, 700);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage(language === 'hi' ? 'सभी फ़ील्ड भरना अनिवार्य है' : 'All fields are required');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords do not match');
      return;
    }

    if (!mnemonicConfirmed) {
      setErrorMessage(language === 'hi' ? 'कृपया पुष्टि करें कि आपने 12-शब्दों की रिकवरी की सुरक्षित कर ली है' : 'Please confirm that you have saved your 12-word seed phrase');
      return;
    }

    setIsLoading(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        pin: pin || '1234',
        mnemonic: generatedMnemonic,
        kycTier: 2,
        is2FAEnabled: true,
        avatarSeed: name.trim(),
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      const storedUsersRaw = localStorage.getItem('flash_crypto_registered_users');
      const registeredUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : DEFAULT_DEMO_USERS;
      const updated = [...registeredUsers, newUser];

      localStorage.setItem('flash_crypto_registered_users', JSON.stringify(updated));
      localStorage.setItem('flash_crypto_active_user', JSON.stringify(newUser));

      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess(newUser);
    }, 800);
  };

  // Submit 12-Word Seed Login
  const handleMnemonicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const words = inputMnemonic.trim().split(/\s+/);
    if (words.length < 12) {
      setErrorMessage(language === 'hi' ? 'कृपया पूरे 12 शब्द दर्ज करें' : 'Please enter all 12 words of your seed phrase');
      return;
    }

    setIsLoading(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      const userFromSeed: User = {
        id: `user-seed-${Date.now()}`,
        name: `Vault-${words[0].toUpperCase()}`,
        email: `${words[0]}@sandbox.vault`,
        pin: '1234',
        mnemonic: inputMnemonic.trim(),
        kycTier: 2,
        is2FAEnabled: true,
        avatarSeed: words[0],
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };

      localStorage.setItem('flash_crypto_active_user', JSON.stringify(userFromSeed));
      setIsLoading(false);
      playAudioFeedback('success');
      onLoginSuccess(userFromSeed);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn relative my-8">
        
        {/* Close button if dismissable */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 mx-auto shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? t.authLogin : mode === 'register' ? t.authRegister : t.authSeedLogin}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'फ्लैश बीटीसी & यूएसडीटी वॉलेट वॉल्ट में सुरक्षित प्रवेश'
              : 'Secure access to 200-Day Flash Crypto Sandbox Vault'}
          </p>
        </div>

        {/* 1-Click Demo Login Quick Button */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{t.authDemoLogin}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {language === 'hi' ? 'या क्रेडेंशियल्स दर्ज करें' : 'Or Enter Credentials'}
          </span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  placeholder="trader@sandbox.crypto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authPassword}
              </label>
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
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

            {/* Switch to Seed Login or Register */}
            <div className="pt-2 flex flex-col gap-2 text-center text-xs">
              <button
                type="button"
                onClick={handleStartMnemonicLogin}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition underline"
              >
                {t.authSeedLogin}
              </button>

              <div className="text-slate-400">
                <span>{t.authNoAccount} </span>
                <button
                  type="button"
                  onClick={handleStartRegister}
                  className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
                >
                  {t.authCreateAccount}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.authName}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Satoshi Nakamoto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
            </div>

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
                  placeholder="trader@sandbox.crypto"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t.authPassword}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {t.authConfirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  required
                />
              </div>
            </div>

            {/* Generated 12-Word Seed Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-400">
                  {language === 'hi' ? '12-शब्दों की रिकवरी सीक्रेट की' : '12-Word Secret Recovery Key'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMnemonic}
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                >
                  {copiedMnemonic ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMnemonic ? t.authSeedCopied : 'Copy Key'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                {generatedMnemonic.split(' ').map((w, idx) => (
                  <div key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300">
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
                  className="mt-0.5 rounded border-slate-700 accent-amber-400"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  {language === 'hi'
                    ? 'मैंने 12-शब्दों की सीक्रेट रिकवरी फ्रेज सुरक्षित रख ली है।'
                    : 'I have safely saved my 12-word recovery seed phrase.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.authSignUpButton}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              <span>{t.authHaveAccount} </span>
              <button
                type="button"
                onClick={handleStartLogin}
                className="text-amber-400 hover:text-amber-300 font-bold underline ml-1"
              >
                {t.authLogin}
              </button>
            </div>
          </form>
        )}

        {/* MODE: 12-WORD MNEMONIC LOGIN */}
        {mode === 'mnemonic_login' && (
          <form onSubmit={handleMnemonicSubmit} className="space-y-4">
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
              <span className="text-[10px] text-slate-500 mt-1 block">
                {language === 'hi' ? '12 शब्दों को स्पेस देकर लिखें' : 'Enter 12 words separated by spaces'}
              </span>
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
                  <span>{language === 'hi' ? 'सीड फ्रेज से अनलॉक करें' : 'Restore & Unlock Vault'}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={handleStartLogin}
                className="text-amber-400 hover:text-amber-300 font-medium underline"
              >
                ← {language === 'hi' ? 'ईमेल और पासवर्ड लॉगिन पर वापस जाएं' : 'Back to Email Login'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
