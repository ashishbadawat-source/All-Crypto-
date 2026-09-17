import React, { useState } from 'react';
import { ArrowDownUp, Zap, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, Settings2 } from 'lucide-react';
import { Language, AssetType, Wallet } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface InstantSwapEngineProps {
  wallets: Wallet[];
  selectedWalletId: string;
  language: Language;
  onExecuteSwap: (fromAsset: AssetType, toAsset: AssetType, fromAmount: number, toAmount: number) => void;
}

export const InstantSwapEngine: React.FC<InstantSwapEngineProps> = ({
  wallets,
  selectedWalletId,
  language,
  onExecuteSwap
}) => {
  const [fromAsset, setFromAsset] = useState<AssetType>('BTC');
  const [toAsset, setToAsset] = useState<AssetType>('USDT_TRC20');
  const [fromAmount, setFromAmount] = useState<string>('0.5');
  const [slippage, setSlippage] = useState<string>('0.5%');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapSuccess, setSwapSuccess] = useState<boolean>(false);

  const activeWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];
  const fromBalance = activeWallet?.balances[fromAsset] || 0;
  const toBalance = activeWallet?.balances[toAsset] || 0;

  const fromRate = ASSET_CONFIGS[fromAsset]?.usdRate || 1;
  const toRate = ASSET_CONFIGS[toAsset]?.usdRate || 1;

  const numFromAmount = parseFloat(fromAmount) || 0;
  const calculatedToAmount = (numFromAmount * fromRate) / toRate;
  const minimumReceived = calculatedToAmount * 0.995;

  const handleFlipAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    playAudioFeedback('click');
  };

  const handleMax = () => {
    setFromAmount(fromBalance.toString());
    playAudioFeedback('click');
  };

  const handlePerformSwap = () => {
    if (numFromAmount <= 0) return;
    if (numFromAmount > fromBalance) {
      alert(language === 'hi' ? 'अपर्याप्त बैलेंस!' : 'Insufficient balance!');
      return;
    }

    setIsSwapping(true);
    playAudioFeedback('broadcast');

    setTimeout(() => {
      onExecuteSwap(fromAsset, toAsset, numFromAmount, calculatedToAmount);
      setIsSwapping(false);
      setSwapSuccess(true);
      playAudioFeedback('success');
      setTimeout(() => setSwapSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-lg mx-auto shadow-2xl space-y-4 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <ArrowDownUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {language === 'hi' ? 'इंस्टेंट क्रिप्टो स्वैप & ब्रिज' : 'Instant Flash Crypto Swap'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? '0% स्लिपेज के साथ रियल-टाइम विकेंद्रीकृत एक्सचेंज' : 'Zero-slippage automated liquidity routing'}
            </p>
          </div>
        </div>

        {/* Slippage tolerance */}
        <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
          <Settings2 className="w-3.5 h-3.5" />
          <span>{slippage}</span>
        </div>
      </div>

      {/* FROM BOX */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{language === 'hi' ? 'आप बेच रहे हैं (Pay):' : 'You Pay:'}</span>
          <span className="font-mono">
            {language === 'hi' ? 'बैलेंस:' : 'Available:'}{' '}
            <span className="text-amber-400 font-bold">{fromBalance.toLocaleString()} {ASSET_CONFIGS[fromAsset].symbol}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-transparent font-mono text-2xl font-bold text-white outline-none placeholder-slate-600"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleMax}
              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-mono font-bold transition"
            >
              MAX
            </button>

            <select
              value={fromAsset}
              onChange={(e) => setFromAsset(e.target.value as AssetType)}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="USDT_TRC20">USDT (TRC-20)</option>
              <option value="TRX">TRX (Tron)</option>
              <option value="ETH">ETH (Ethereum)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          ≈ ${(numFromAmount * fromRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
        </div>
      </div>

      {/* FLIP BUTTON */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleFlipAssets}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-full shadow-lg transition hover:rotate-180"
          title="Switch Pair"
        >
          <ArrowDownUp className="w-4 h-4" />
        </button>
      </div>

      {/* TO BOX */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{language === 'hi' ? 'आप प्राप्त करेंगे (Receive):' : 'You Receive:'}</span>
          <span className="font-mono">
            {language === 'hi' ? 'बैलेंस:' : 'Balance:'}{' '}
            <span className="text-emerald-400 font-bold">{toBalance.toLocaleString()} {ASSET_CONFIGS[toAsset].symbol}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            readOnly
            value={calculatedToAmount > 0 ? calculatedToAmount.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}
            className="w-full bg-transparent font-mono text-2xl font-bold text-emerald-400 outline-none select-all"
          />

          <select
            value={toAsset}
            onChange={(e) => setToAsset(e.target.value as AssetType)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="USDT_TRC20">USDT (TRC-20)</option>
            <option value="BTC">BTC (Bitcoin)</option>
            <option value="TRX">TRX (Tron)</option>
            <option value="ETH">ETH (Ethereum)</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          ≈ ${(calculatedToAmount * toRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
        </div>
      </div>

      {/* Swap Breakdown Details */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
        <div className="flex justify-between">
          <span>Exchange Rate:</span>
          <span className="text-slate-200">1 {ASSET_CONFIGS[fromAsset].symbol} = {(fromRate / toRate).toFixed(4)} {ASSET_CONFIGS[toAsset].symbol}</span>
        </div>
        <div className="flex justify-between">
          <span>Minimum Received:</span>
          <span className="text-emerald-400 font-semibold">{minimumReceived.toFixed(4)} {ASSET_CONFIGS[toAsset].symbol}</span>
        </div>
        <div className="flex justify-between">
          <span>Routing Protocol:</span>
          <span className="text-cyan-400">Mempool Instant AMM Pool</span>
        </div>
        <div className="flex justify-between">
          <span>Validity Lock:</span>
          <span className="text-amber-400 font-bold">200 Days Guaranteed</span>
        </div>
      </div>

      {/* SWAP EXECUTION BUTTON */}
      <button
        onClick={handlePerformSwap}
        disabled={isSwapping || numFromAmount <= 0}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
      >
        {isSwapping ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            <span>{language === 'hi' ? 'ब्लॉकचेन रूटिंग और स्वैप हो रहा है...' : 'Routing Swap on Mempool...'}</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{language === 'hi' ? 'इंस्टेंट स्वैप कन्फर्म करें' : 'Confirm Instant Swap'}</span>
          </>
        )}
      </button>

      {/* Success Notification */}
      {swapSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'hi'
              ? 'स्वैप सफल रहा! नया बैलेंस वॉलेट में क्रेडिट कर दिया गया है।'
              : 'Swap completed successfully! New balance credited to vault.'}
          </span>
        </div>
      )}

    </div>
  );
};
