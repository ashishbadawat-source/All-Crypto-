import React, { useState } from 'react';
import { Send, ArrowRightLeft, Bitcoin, DollarSign, Flame, Layers, ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, Check, Copy, FileText, Printer } from 'lucide-react';
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
  onViewReceipt?: (tx: {
    id: string;
    txid: string;
    assetType: AssetType;
    amount: number;
    fee: number;
    feeAsset: string;
    fromWalletId: string;
    fromAddress: string;
    toWalletId?: string;
    toAddress: string;
    timestamp: number;
    status: 'CONFIRMED';
    confirmations: number;
    maxConfirmations: number;
    blockHeight: number;
    validityDays: number;
    expiresAt: number;
    memo?: string;
  }) => void;
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
    fee: number;
    expiresAt: number;
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
    if (senderBalance > 0) {
      setAmount(senderBalance.toString());
      playAudioFeedback('click');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert(language === 'hi' ? 'कृपया मान्य मात्रा दर्ज करें' : 'Please enter a valid amount');
      return;
    }

    if (numAmount > senderBalance) {
      alert(
        language === 'hi'
          ? `अपर्याप्त बैलेंस! आपके पास केवल ${senderBalance} ${config.symbol} उपलब्ध है।`
          : `Insufficient balance! You only have ${senderBalance} ${config.symbol}.`
      );
      return;
    }

    if (!recipientAddress.trim()) {
      setAddressError(language === 'hi' ? 'प्राप्तकर्ता का एड्रेस आवश्यक है' : 'Recipient address is required');
      return;
    }

    const isValid = validateAddress(recipientAddress.trim(), assetType);
    if (!isValid) {
      setAddressError(
        language === 'hi'
          ? `यह एड्रेस ${config.network} के लिए मान्य प्रारूप में नहीं है।`
          : `This address is not in a valid format for ${config.network}.`
      );
      return;
    }

    // Begin Simulated Multi-Step Mempool Broadcast
    setIsBroadcasting(true);
    setBroadcastStep(1);
    setBroadcastLog(language === 'hi' ? '1/4: ट्रांजेक्शन स्क्रिप्ट और एलिप्टिक कर्व सिग्नेचर साइन हो रहा है...' : '1/4: Generating elliptic curve ECDSA signature...');
    playAudioFeedback('broadcast');

    setTimeout(() => {
      setBroadcastStep(2);
      setBroadcastLog(language === 'hi' ? '2/4: P2P नोड्स में मेमपूल ब्रॉडकास्ट हो रहा है...' : '2/4: Broadcasting raw hex transaction into mempool...');
      playAudioFeedback('click');

      setTimeout(() => {
        setBroadcastStep(3);
        setBroadcastLog(language === 'hi' ? '3/4: माइनर्स द्वारा ब्लॉक में शामिल किया जा रहा है...' : '3/4: Included in next pending block by miners...');
        playAudioFeedback('click');

        setTimeout(() => {
          setBroadcastStep(4);
          setBroadcastLog(language === 'hi' ? '4/4: कन्फर्मेशन 6/6 पूर्ण! बैलेंस रिसीवर वॉलेट में क्रेडिट हुआ।' : '4/4: Confirmed 6/6! Balances successfully synchronized.');

          // Trigger state update
          onSendTransaction(
            fromWalletId,
            recipientAddress.trim(),
            assetType,
            numAmount,
            currentFee.low,
            targetReceiverWalletId || undefined
          );

          const generatedTxid = generateTxid();
          const targetW = wallets.find(w => w.id === targetReceiverWalletId);
          const expiresAt = Date.now() + (200 * 86400000);

          setLastTxSuccess({
            txid: generatedTxid,
            from: senderWallet.name,
            to: recipientAddress.trim(),
            amount: numAmount,
            assetType,
            receiverName: targetW ? (language === 'hi' ? targetW.nameHi : targetW.name) : undefined,
            fee: currentFee.low,
            expiresAt
          });

          setIsBroadcasting(false);
          setAmount('');
          playAudioFeedback('success');

          // Trigger Confetti Celebration
          confetti({
            particleCount: 55,
            spread: 60,
            origin: { y: 0.6 }
          });

        }, 800);
      }, 700);
    }, 650);
  };

  const handleCopyTxid = () => {
    if (lastTxSuccess) {
      navigator.clipboard.writeText(lastTxSuccess.txid);
      setCopiedTxid(true);
      playAudioFeedback('click');
      setTimeout(() => setCopiedTxid(false), 2000);
    }
  };

  const handleOpenReceipt = () => {
    if (lastTxSuccess && onViewReceipt) {
      onViewReceipt({
        id: `tx-${Date.now()}`,
        txid: lastTxSuccess.txid,
        assetType: lastTxSuccess.assetType,
        amount: lastTxSuccess.amount,
        fee: lastTxSuccess.fee,
        feeAsset: lastTxSuccess.assetType === 'BTC' ? 'BTC' : lastTxSuccess.assetType === 'ETH' ? 'ETH' : 'TRX',
        fromWalletId: senderWallet.id,
        fromAddress: senderWallet.addressBtc,
        toWalletId: targetReceiverWalletId,
        toAddress: lastTxSuccess.to,
        timestamp: Date.now(),
        status: 'CONFIRMED',
        confirmations: 6,
        maxConfirmations: 6,
        blockHeight: 894126,
        validityDays: 200,
        expiresAt: lastTxSuccess.expiresAt,
        memo: 'Simulated Network Transfer'
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 max-w-3xl mx-auto shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t.transferTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {t.transferSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        
        {/* Step 1: Select Source Wallet & Asset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Source Wallet */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {language === 'hi' ? 'भेजने वाला वॉलेट (Source Vault)' : 'Source Vault'}
            </label>
            <select
              value={fromWalletId}
              onChange={(e) => setFromWalletId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-white focus:border-emerald-400 outline-none"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {language === 'hi' ? w.nameHi : w.name} ({w.balances[assetType]} {config.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Asset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {language === 'hi' ? 'क्रिप्टो एसेट' : 'Cryptocurrency Asset'}
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
              placeholder={assetType === 'BTC' ? 'bc1q...' : assetType === 'USDT_TRC20' || assetType === 'TRX' ? 'TX8r5q...' : '0x71C...'}
              className={`w-full rounded-xl bg-slate-950 border ${
                addressError ? 'border-red-500 focus:border-red-400' : 'border-slate-700 focus:border-emerald-400'
              } px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none`}
              required
            />

            {addressError && (
              <p className="text-xs text-red-400 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{addressError}</span>
              </p>
            )}

            {/* Fast 1-Click Simulated Receiver Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-400 font-medium block">
                {t.orSelectSaved}:
              </span>
              <div className="flex flex-wrap gap-2">
                {wallets
                  .filter((w) => w.id !== fromWalletId)
                  .map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectPresetReceiver(w)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        targetReceiverWalletId === w.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>{language === 'hi' ? w.nameHi : w.name}</span>
                    </button>
                  ))}
              </div>
            </div>

          </div>
        </div>

        {/* Step 4: Network Priority & Miner Fee */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            {t.networkFee}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: t.lowFee, desc: '~10 mins' },
              { id: 'med', label: t.medFee, desc: '~3 mins' },
              { id: 'high', label: t.highFee, desc: '~Instant (Flash)' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFeePriority(f.id as any)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  feePriority === f.id
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold">{f.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Broadcast Button */}
        <button
          type="submit"
          disabled={isBroadcasting || senderBalance <= 0}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Broadcast Live Progress Stepper */}
      {isBroadcasting && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 font-mono">BROADCASTING TO MEMPOOL</span>
            <span className="text-slate-400 font-mono">Step {broadcastStep}/4</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(broadcastStep / 4) * 100}%` }}
            ></div>
          </div>

          <p className="text-xs font-mono text-slate-300">{broadcastLog}</p>
        </div>
      )}

      {/* Success Receipt Card */}
      {lastTxSuccess && !isBroadcasting && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 animate-fadeIn">
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

          {/* Quick Action Buttons: View Voucher + Wallets + Explorer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleOpenReceipt}
              className="py-2.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-500/40"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रसीद / वाउचर देखें' : 'View Receipt Voucher'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('wallets')}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition text-center"
            >
              {language === 'hi' ? 'रिसीवर वॉलेट बैलेंस' : 'Target Wallet'}
            </button>

            <button
              onClick={() => onNavigateTab('explorer')}
              className="py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition text-center border border-emerald-500/30"
            >
              {language === 'hi' ? 'एक्सप्लोरर में देखें' : 'View on Explorer'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
