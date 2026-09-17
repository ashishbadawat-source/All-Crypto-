import React, { useState } from 'react';
import { Send, ArrowRightLeft, Bitcoin, DollarSign, Flame, Layers, ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssetType, Language, Wallet } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { generateTxid, playAudioFeedback, validateAddress, truncateHash } from '../utils/cryptoUtils';

interface TransferEngineProps {
  wallets: Wallet[];
  selectedWalletId: string;
  language: Language;
  onSendTransaction: (
    fromWalletId: string,
    toAddress: string,
    assetType: AssetType,
    amount: number,
    fee: number,
    toWalletId?: string
  ) => void;
  onViewReceipt?: (txid: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const TransferEngine: React.FC<TransferEngineProps> = ({
  wallets,
  selectedWalletId,
  language,
  onSendTransaction,
  onViewReceipt,
  onNavigateTab
}) => {
  const t = translations[language];

  const [fromWalletId, setFromWalletId] = useState<string>(selectedWalletId || wallets[0]?.id || 'wallet-main');
  const [assetType, setAssetType] = useState<AssetType>('BTC');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [targetReceiverWalletId, setTargetReceiverWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [feePriority, setFeePriority] = useState<'low' | 'med' | 'high'>('high');
  const [memo, setMemo] = useState<string>('');
  
  // State for broadcast progress
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStep, setBroadcastStep] = useState<number>(0);
  const [broadcastLog, setBroadcastLog] = useState<string>('');
  const [lastTxSuccess, setLastTxSuccess] = useState<{
    txid: string;
    from: string;
    to: string;
    amount: number;
    assetType: AssetType;
    receiverName?: string;
  } | null>(null);

  const [addressError, setAddressError] = useState<string | null>(null);
  const [copiedTxid, setCopiedTxid] = useState(false);

  const senderWallet = wallets.find(w => w.id === fromWalletId) || wallets[0];
  const senderBalance = senderWallet ? senderWallet.balances[assetType] : 0;
  const config = ASSET_CONFIGS[assetType];

  // Fee calculation
  const feeValues: Record<AssetType, { low: number; med: number; high: number; unit: string }> = {
    BTC: { low: 0.00005, med: 0.00015, high: 0.00030, unit: 'BTC' },
    USDT_TRC20: { low: 8.0, med: 14.5, high: 28.0, unit: 'TRX Energy' },
    TRX: { low: 1.0, med: 2.5, high: 5.0, unit: 'TRX' },
    ETH: { low: 0.0012, med: 0.0028, high: 0.0055, unit: 'ETH' }
  };
  const currentFee = feeValues[assetType][feePriority];

  const handleSelectPresetReceiver = (w: Wallet) => {
    setTargetReceiverWalletId(w.id);
    if (assetType === 'BTC') {
      setRecipientAddress(w.addressBtc);
    } else if (assetType === 'USDT_TRC20' || assetType === 'TRX') {
      setRecipientAddress(w.addressTron);
    } else {
      setRecipientAddress(w.addressEth);
    }
    setAddressError(null);
    playAudioFeedback('click');
  };

  const handleAssetChange = (newAsset: AssetType) => {
    setAssetType(newAsset);
    setAddressError(null);
    // If a preset wallet is selected, update address to match asset
    if (targetReceiverWalletId) {
      const targetW = wallets.find(w => w.id === targetReceiverWalletId);
      if (targetW) {
        if (newAsset === 'BTC') setRecipientAddress(targetW.addressBtc);
        else if (newAsset === 'USDT_TRC20' || newAsset === 'TRX') setRecipientAddress(targetW.addressTron);
        else setRecipientAddress(targetW.addressEth);
      }
    }
    playAudioFeedback('click');
  };

  const handleMaxAmount = () => {
    if (senderBalance <= 0) return;
    setAmount(senderBalance.toString());
    playAudioFeedback('click');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert(language === 'hi' ? 'कृपया सही राशि दर्ज करें' : 'Please enter a valid transfer amount');
      return;
    }

    if (numAmount > senderBalance) {
      alert(language === 'hi' ? 'अपर्याप्त बैलेंस! पहले फ्लैश क्रिप्टो जनरेट करें।' : 'Insufficient balance! Please generate flash crypto first.');
      return;
    }

    // Validate address
    const validation = validateAddress(recipientAddress, assetType);
    if (!validation.isValid) {
      setAddressError(validation.message || 'Invalid address');
      return;
    }
    setAddressError(null);

    // Start animated multi-node broadcast
    setIsBroadcasting(true);
    setBroadcastStep(1);
    setBroadcastLog(language === 'hi' ? '1/4: ट्रांजेक्शन क्रिप्टोग्राफिक रूप से साइन किया जा रहा है...' : '1/4: Cryptographically signing UTXO with private key...');
    playAudioFeedback('broadcast');

    setTimeout(() => {
      setBroadcastStep(2);
      setBroadcastLog(language === 'hi' ? '2/4: 2,048 पीयर-टू-पीयर नोड्स में ब्रॉडकास्ट हो रहा है...' : '2/4: Broadcasting to 2,048 P2P blockchain nodes...');
    }, 600);

    setTimeout(() => {
      setBroadcastStep(3);
      setBroadcastLog(language === 'hi' ? '3/4: मेमपूल सत्यापन पूरा — ब्लॉक माइनिंग प्रगति पर...' : '3/4: Mempool verified — Mining in next block...');
    }, 1300);

    setTimeout(() => {
      setBroadcastStep(4);
      setBroadcastLog(language === 'hi' ? '4/4: ब्लॉक कन्फर्मेशन प्राप्त! रिसीवर वॉलेट में फंड ट्रांसफर पूरा हुआ।' : '4/4: Block confirmed! Funds successfully transferred to target wallet.');

      // Execute real state transfer
      const txid = generateTxid();
      const detectedReceiver = wallets.find(
        w => w.addressBtc === recipientAddress || w.addressTron === recipientAddress || w.addressEth === recipientAddress
      );

      onSendTransaction(
        fromWalletId,
        recipientAddress,
        assetType,
        numAmount,
        currentFee,
        detectedReceiver ? detectedReceiver.id : undefined
      );

      setLastTxSuccess({
        txid,
        from: senderWallet.name,
        to: recipientAddress,
        amount: numAmount,
        assetType,
        receiverName: detectedReceiver ? (language === 'hi' ? detectedReceiver.nameHi : detectedReceiver.name) : undefined
      });

      setIsBroadcasting(false);
      playAudioFeedback('success');
      setAmount('');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // no-op
      }
    }, 2100);
  };

  const handleCopyTxid = () => {
    if (!lastTxSuccess) return;
    navigator.clipboard.writeText(lastTxSuccess.txid);
    setCopiedTxid(true);
    setTimeout(() => setCopiedTxid(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t.transferTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {t.transferSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Step 1: Sender Wallet & Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Sender Wallet */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {language === 'hi' ? 'सेंडर वॉलेट' : 'Sender Wallet'}
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {language === 'hi' ? w.nameHi : w.name} ({w.balances[assetType]} {assetType})
                </option>
              ))}
            </select>
          </div>

          {/* Select Asset */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t.selectAsset}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['BTC', 'USDT_TRC20', 'TRX', 'ETH'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAssetChange(type)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition ${
                    assetType === type
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'USDT_TRC20' ? 'USDT' : type}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Step 2: Available Balance & Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {language === 'hi' ? 'ट्रांसफर करने की मात्रा' : 'Transfer Amount'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {language === 'hi' ? 'उपलब्ध:' : 'Available:'}{' '}
                <span className="font-mono font-bold text-white">
                  {senderBalance.toLocaleString('en-US', { maximumFractionDigits: 6 })} {config.symbol}
                </span>
              </span>
              <button
                type="button"
                onClick={handleMaxAmount}
                className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="relative rounded-xl shadow-sm">
            <input
              type="number"
              step="any"
              min="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-lg font-mono font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
              placeholder="0.00"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                {config.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Recipient Address */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.recipientAddress}
            </label>
            <span className="text-[10px] text-slate-500">
              {assetType === 'BTC' ? 'Supports Native SegWit (bc1q...) & Legacy (1...)' : assetType === 'USDT_TRC20' || assetType === 'TRX' ? 'TRON TRC-20 (T...)' : 'ERC-20 (0x...)'}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setTargetReceiverWalletId('');
                setAddressError(null);
              }}
              placeholder={
                assetType === 'BTC'
                  ? 'bc1q... या 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
                  : assetType === 'USDT_TRC20' || assetType === 'TRX'
                  ? 'TNPwZzZ6V6B8pP3j2mK1n4u7V6y8w0X3j5...'
                  : '0x71C38283E20F0D8E73B90B5548f71B4eE3B128e4'
              }
              className={`w-full rounded-xl bg-slate-950 border px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none ${
                addressError
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-slate-700 focus:border-emerald-400'
              }`}
              required
            />
            {addressError && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{addressError}</span>
              </p>
            )}
          </div>

          {/* Preset Simulated Receiver Wallets Fast Picker */}
          <div className="mt-3">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
              {t.orSelectSaved}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {wallets.filter(w => w.id !== fromWalletId).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectPresetReceiver(w)}
                  className={`p-2 rounded-lg border text-left text-xs transition ${
                    targetReceiverWalletId === w.id
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{language === 'hi' ? w.nameHi : w.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {language === 'hi' ? 'बैलेंस:' : 'Bal:'} {w.balances[assetType]} {assetType}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Network Fee Priority */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.networkFee}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFeePriority('low')}
              className={`p-2 rounded-lg border text-center transition ${
                feePriority === 'low'
                  ? 'bg-slate-800 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[11px] font-bold">{language === 'hi' ? 'स्टैंडर्ड' : 'Standard'}</div>
              <div className="text-[10px] font-mono text-slate-400">{feeValues[assetType].low} {feeValues[assetType].unit}</div>
            </button>
            <button
              type="button"
              onClick={() => setFeePriority('med')}
              className={`p-2 rounded-lg border text-center transition ${
                feePriority === 'med'
                  ? 'bg-slate-800 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[11px] font-bold">{language === 'hi' ? 'प्रायरिटी' : 'Priority'}</div>
              <div className="text-[10px] font-mono text-slate-400">{feeValues[assetType].med} {feeValues[assetType].unit}</div>
            </button>
            <button
              type="button"
              onClick={() => setFeePriority('high')}
              className={`p-2 rounded-lg border text-center transition ${
                feePriority === 'high'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-[11px] font-bold text-amber-300">{language === 'hi' ? 'फ्लैश इंस्टेंट' : 'Flash Instant'}</div>
              <div className="text-[10px] font-mono text-amber-400">{feeValues[assetType].high} {feeValues[assetType].unit}</div>
            </button>
          </div>
        </div>

        {/* Broadcasting Progress Bar */}
        {isBroadcasting && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 animate-pulse">{broadcastLog}</span>
              <span className="font-mono text-slate-400">{broadcastStep}/4</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(broadcastStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isBroadcasting || senderBalance <= 0}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
            isBroadcasting || senderBalance <= 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isBroadcasting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>{t.sendingTx}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.sendTx}</span>
            </>
          )}
        </button>
      </form>

      {/* Success Receipt Banner */}
      {lastTxSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.txSuccess}</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Status: 6/6 Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">TRANSFERRED AMOUNT</span>
              <span className="text-emerald-300 font-bold">{lastTxSuccess.amount} {lastTxSuccess.assetType}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TARGET RECEIVER</span>
              <span className="text-slate-200 font-bold">{lastTxSuccess.receiverName || truncateHash(lastTxSuccess.to, 8, 8)}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-[10px] block">TXID</span>
              <div className="flex items-center justify-between text-slate-300 mt-0.5">
                <span className="truncate mr-2">{lastTxSuccess.txid}</span>
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

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('wallets')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition text-center"
            >
              {language === 'hi' ? 'रिसीवर वॉलेट बैलेंस चेक करें' : 'View Target Wallet Balance'}
            </button>
            <button
              onClick={() => onNavigateTab('explorer')}
              className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition text-center border border-emerald-500/30"
            >
              {language === 'hi' ? 'ब्लॉकचेन एक्सप्लोरर में देखें' : 'View on Explorer'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
