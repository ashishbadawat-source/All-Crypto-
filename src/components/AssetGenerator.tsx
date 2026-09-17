import React, { useState } from 'react';
import { Zap, Bitcoin, DollarSign, Flame, Layers, Clock, ShieldCheck, CheckCircle2, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssetType, Language, Wallet } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { generateTxid, playAudioFeedback, truncateHash } from '../utils/cryptoUtils';

interface AssetGeneratorProps {
  wallets: Wallet[];
  selectedWalletId: string;
  language: Language;
  onMintAsset: (
    assetType: AssetType,
    amount: number,
    targetWalletId: string,
    validityDays: number,
    memo?: string
  ) => void;
}

export const AssetGenerator: React.FC<AssetGeneratorProps> = ({
  wallets,
  selectedWalletId,
  language,
  onMintAsset
}) => {
  const t = translations[language];

  const [assetType, setAssetType] = useState<AssetType>('BTC');
  const [amount, setAmount] = useState<string>('3.5');
  const [validityDays] = useState<number>(300); // 300 Days per updated user specification
  const [targetWalletId, setTargetWalletId] = useState<string>(selectedWalletId || wallets[0]?.id || 'wallet-main');
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedData, setLastMintedData] = useState<{
    txid: string;
    assetType: AssetType;
    amount: number;
    walletAddress: string;
    expiresAt: number;
  } | null>(null);
  const [copiedTxid, setCopiedTxid] = useState(false);

  const config = ASSET_CONFIGS[assetType];

  const presets: Record<AssetType, number[]> = {
    BTC: [0.5, 1.0, 2.5, 3.5, 5.0, 10.0],
    USDT_TRC20: [5000, 25000, 50000, 75000, 100000],
    TRX: [25000, 100000, 250000, 500000],
    ETH: [2.5, 5.0, 10.0, 15.0, 25.0]
  };

  const handleAssetSelect = (type: AssetType) => {
    setAssetType(type);
    if (type === 'BTC') setAmount('3.5');
    else if (type === 'USDT_TRC20') setAmount('75000');
    else if (type === 'TRX') setAmount('250000');
    else if (type === 'ETH') setAmount('15.0');
    playAudioFeedback('click');
  };

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsMinting(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      onMintAsset(assetType, numAmount, targetWalletId, validityDays, `300-Day Flash ${assetType} Mint Batch`);
      
      const targetWallet = wallets.find(w => w.id === targetWalletId);
      const targetAddress = assetType === 'BTC' ? targetWallet?.addressBtc : (assetType === 'USDT_TRC20' || assetType === 'TRX') ? targetWallet?.addressTron : targetWallet?.addressEth;
      const txid = generateTxid();

      setLastMintedData({
        txid,
        assetType,
        amount: numAmount,
        walletAddress: targetAddress || 'External Address',
        expiresAt: Date.now() + (validityDays * 86400000)
      });

      setIsMinting(false);
      playAudioFeedback('success');

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // no-op
      }
    }, 1200);
  };

  const handleCopyTxid = () => {
    if (!lastMintedData) return;
    navigator.clipboard.writeText(lastMintedData.txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t.genTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {t.genSubtitle}
        </p>
      </div>

      <form onSubmit={handleMint} className="space-y-5">
        
        {/* Step 1: Asset Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            1. {t.selectAsset}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* BTC */}
            <button
              type="button"
              onClick={() => handleAssetSelect('BTC')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                assetType === 'BTC'
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Bitcoin className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-bold">Bitcoin (BTC)</span>
              <span className="text-[10px] text-slate-400">SegWit Network</span>
            </button>

            {/* USDT TRC-20 */}
            <button
              type="button"
              onClick={() => handleAssetSelect('USDT_TRC20')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                assetType === 'USDT_TRC20'
                  ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <span className="text-xs font-bold">USDT (TRC-20)</span>
              <span className="text-[10px] text-slate-400">TRON Network</span>
            </button>

            {/* TRX */}
            <button
              type="button"
              onClick={() => handleAssetSelect('TRX')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                assetType === 'TRX'
                  ? 'bg-red-500/15 border-red-400 text-red-300 ring-1 ring-red-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Flame className="w-6 h-6 text-red-400" />
              <span className="text-xs font-bold">TRON (TRX)</span>
              <span className="text-[10px] text-slate-400">TRX Energy Net</span>
            </button>

            {/* ETH */}
            <button
              type="button"
              onClick={() => handleAssetSelect('ETH')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                assetType === 'ETH'
                  ? 'bg-indigo-500/15 border-indigo-400 text-indigo-300 ring-1 ring-indigo-400 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Layers className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold">Ethereum (ETH)</span>
              <span className="text-[10px] text-slate-400">ERC-20</span>
            </button>
          </div>
        </div>

        {/* Step 2: Amount & Presets */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. {t.enterAmount}
            </label>
            <span className="text-xs font-mono text-slate-400">
              {amount ? `≈ $${(parseFloat(amount || '0') * config.usdRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD` : ''}
            </span>
          </div>
          
          <div className="relative rounded-xl shadow-sm">
            <input
              type="number"
              step="any"
              min="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-lg font-mono font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                {config.symbol}
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold mr-1 self-center">Presets:</span>
            {presets[assetType].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val.toString());
                  playAudioFeedback('click');
                }}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition ${
                  amount === val.toString()
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                +{val} {config.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: 300-Day Validity Locked Spec */}
        <div className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                {t.validityPeriod}: 300 Days (Locked)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              OP_CHECKLOCKTIMEVERIFY
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {t.validityDescription}
          </p>
        </div>

        {/* Step 4: Destination Wallet */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              3. {t.destinationWallet}
            </label>
            <span className="text-[10px] text-amber-400 font-semibold">
              {language === 'hi' ? 'बाइनेंस या अन्य वॉलेट चुनें' : 'Choose Binance or Vault'}
            </span>
          </div>

          <select
            value={targetWalletId}
            onChange={(e) => setTargetWalletId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {language === 'hi' ? w.nameHi : w.name} ({w.type === 'sender' ? 'Sender' : 'Receiver'})
              </option>
            ))}
          </select>

          {/* 1-Click Fast Destination Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {wallets.map((w) => {
              const isBinance = w.id === 'wallet-binance' || w.id === 'wallet-receiver-2';
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setTargetWalletId(w.id);
                    playAudioFeedback('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                    targetWalletId === w.id
                      ? isBinance
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-sm'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : isBinance
                      ? 'bg-slate-950/80 text-yellow-400/90 border-yellow-500/30 hover:border-yellow-400'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isBinance ? 'bg-yellow-400' : 'bg-amber-400'}`}></span>
                  <span>{isBinance ? (language === 'hi' ? '🟡 बाइनेंस (Binance Vault)' : '🟡 Binance Exchange') : (language === 'hi' ? w.nameHi : w.name)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isMinting}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
            isMinting
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isMinting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{t.generating}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{t.generateButton} ({amount} {config.symbol})</span>
            </>
          )}
        </button>
      </form>

      {/* Mint Certificate Result */}
      {lastMintedData && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.mintSuccess}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] block">MINTED AMOUNT</span>
              <span className="text-emerald-300 font-bold">{lastMintedData.amount} {lastMintedData.assetType}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">VALIDITY DURATION</span>
              <span className="text-amber-300 font-bold">300 Days (TTL Active)</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-[10px] block">TRANSACTION HASH (TXID)</span>
              <div className="flex items-center justify-between text-slate-300 mt-0.5">
                <span className="truncate mr-2">{lastMintedData.txid}</span>
                <button
                  onClick={handleCopyTxid}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Copy TXID"
                >
                  {copiedTxid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
