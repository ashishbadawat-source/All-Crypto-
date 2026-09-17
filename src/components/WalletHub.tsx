import React, { useState } from 'react';
import { Wallet as WalletIcon, Smartphone, Building2, HardDrive, Plus, Copy, Check, QrCode, ArrowDownLeft, ArrowUpRight, CheckCircle2, Shield } from 'lucide-react';
import { Wallet, Language, AssetType, Transaction } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { generateAddress, truncateHash, playAudioFeedback } from '../utils/cryptoUtils';

interface WalletHubProps {
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  onAddWallet: (name: string, nameHi: string) => void;
  transactions: Transaction[];
  language: Language;
  onQuickMintAsset?: (assetType: AssetType, amount: number, targetWalletId: string, validityDays: number, memo?: string) => void;
  onOpenQr: (address: string, title: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const WalletHub: React.FC<WalletHubProps> = ({
  wallets,
  selectedWalletId,
  onSelectWallet,
  onAddWallet,
  transactions,
  language,
  onQuickMintAsset,
  onOpenQr,
  onNavigateTab
}) => {
  const t = translations[language];

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [selectedAssetForAddress, setSelectedAssetForAddress] = useState<AssetType>('BTC');
  const [binanceDepositSuccess, setBinanceDepositSuccess] = useState<string | null>(null);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];
  const binanceWallet = wallets.find(w => w.id === 'wallet-binance' || w.id === 'wallet-receiver-2');

  const handleQuickAddBinance = (asset: AssetType, amount: number) => {
    if (!onQuickMintAsset || !binanceWallet) return;
    onQuickMintAsset(asset, amount, binanceWallet.id, 300, `Direct Binance Exchange Flash Deposit`);
    playAudioFeedback('success');
    setBinanceDepositSuccess(`+${amount} ${asset === 'USDT_TRC20' ? 'USDT' : asset} deposited to Binance!`);
    setTimeout(() => setBinanceDepositSuccess(null), 3000);
  };

  // Filter transactions for this wallet
  const walletTxs = transactions.filter(
    tx => tx.fromWalletId === selectedWallet?.id || tx.toWalletId === selectedWallet?.id || tx.toAddress === selectedWallet?.addressBtc || tx.toAddress === selectedWallet?.addressTron
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    playAudioFeedback('click');
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleCreateWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    onAddWallet(newWalletName.trim(), newWalletName.trim());
    setNewWalletName('');
    setShowAddModal(false);
    playAudioFeedback('success');
  };

  const getWalletIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      default:
        return <WalletIcon className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getAddressByAsset = (w: Wallet, asset: AssetType) => {
    if (asset === 'BTC') return w.addressBtc;
    if (asset === 'USDT_TRC20' || asset === 'TRX') return w.addressTron;
    return w.addressEth;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <WalletIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.walletTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {t.walletSubtitle}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createWallet}</span>
        </button>
      </div>

      {/* Binance Exchange Quick Deposit Hub Banner */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-slate-900 border border-yellow-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-yellow-400 text-slate-950 uppercase tracking-wide">
                BINANCE
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{language === 'hi' ? 'बाइनेंस एक्सचेंज डिपॉजिट और बैलेंस हब' : 'Binance Exchange Deposit & Balance Hub'}</span>
                <span className="text-xs text-yellow-400 font-mono">(UID: 894102941 - Verified)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'hi'
                ? 'बाइनेंस में डायरेक्ट 300-दिन का फ्लैश क्रिप्टो बैलेंस जोड़ें या 1-क्लिक में ट्रांसफर भेजें।'
                : 'Instantly add 300-day flash assets to your Binance account or broadcast 1-click test deposits.'}
            </p>
          </div>

          {/* 1-Click Fast Binance Deposit Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onQuickMintAsset && (
              <>
                <button
                  onClick={() => handleQuickAddBinance('USDT_TRC20', 25000)}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  title="Add 25,000 USDT directly to Binance"
                >
                  <Plus className="w-3.5 h-3.5 text-yellow-400" />
                  <span>+25,000 USDT</span>
                </button>

                <button
                  onClick={() => handleQuickAddBinance('BTC', 1.0)}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  title="Add 1.0 BTC directly to Binance"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>+1.0 BTC</span>
                </button>

                <button
                  onClick={() => handleQuickAddBinance('TRX', 100000)}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  title="Add 100,000 TRX directly to Binance"
                >
                  <Plus className="w-3.5 h-3.5 text-red-400" />
                  <span>+100K TRX</span>
                </button>

                <button
                  onClick={() => handleQuickAddBinance('ETH', 5.0)}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  title="Add 5.0 ETH directly to Binance"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>+5.0 ETH</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (binanceWallet) onSelectWallet(binanceWallet.id);
                onNavigateTab('transfer');
              }}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{language === 'hi' ? 'बाइनेंस में भेजें' : 'Send to Binance'}</span>
            </button>
          </div>
        </div>

        {binanceDepositSuccess && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{binanceDepositSuccess}</span>
          </div>
        )}
      </div>

      {/* Wallets Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {wallets.map((w) => {
          const isSelected = w.id === selectedWalletId;
          const isBinance = w.id === 'wallet-binance' || w.id === 'wallet-receiver-2';
          const totalValUsd =
            (w.balances.BTC * ASSET_CONFIGS.BTC.usdRate) +
            (w.balances.USDT_TRC20 * ASSET_CONFIGS.USDT_TRC20.usdRate) +
            (w.balances.TRX * ASSET_CONFIGS.TRX.usdRate) +
            (w.balances.ETH * ASSET_CONFIGS.ETH.usdRate);

          return (
            <div
              key={w.id}
              onClick={() => {
                onSelectWallet(w.id);
                playAudioFeedback('click');
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? isBinance
                    ? 'bg-slate-900 border-yellow-400 ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-500/20'
                    : 'bg-slate-900 border-cyan-500/60 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : isBinance
                  ? 'bg-slate-950/90 border-yellow-500/40 hover:border-yellow-400 hover:bg-slate-900/80 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg border ${isBinance ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-800 border-slate-700'}`}>
                    {getWalletIcon(w.iconName)}
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    isBinance
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                      : w.type === 'sender'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  }`}>
                    {isBinance ? 'BINANCE' : w.type === 'sender' ? 'SENDER' : 'RECEIVER'}
                  </span>
                </div>
                {isSelected && (
                  <span className={`w-2 h-2 rounded-full ${isBinance ? 'bg-yellow-400' : 'bg-cyan-400'} animate-pulse`}></span>
                )}
              </div>

              <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                <span>{language === 'hi' ? w.nameHi : w.name}</span>
              </h3>

              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>BTC:</span>
                  <span className="font-mono font-bold text-amber-300">{w.balances.BTC.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>USDT:</span>
                  <span className="font-mono font-bold text-emerald-300">${w.balances.USDT_TRC20.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TRX:</span>
                  <span className="font-mono font-bold text-red-300">{w.balances.TRX.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Total Value:</span>
                <span className="font-mono font-bold text-slate-200">
                  ${totalValUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Wallet Detailed View */}
      {selectedWallet && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {language === 'hi' ? selectedWallet.nameHi : selectedWallet.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  ID: {selectedWallet.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi'
                  ? 'यह वॉलेट किसी भी फ्लैश बीटीसी, यूएसडीटी (TRC-20) और टीआरएक्स ट्रांसफर प्राप्त करने के लिए तैयार है।'
                  : 'Ready to receive and verify flash crypto transfers with live balance sync.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  onSelectWallet(selectedWallet.id);
                  onNavigateTab('transfer');
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'ट्रांसफर भेजें (Send)' : 'Send Transfer'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectWallet(selectedWallet.id);
                  onNavigateTab('generator');
                }}
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'बैलेंस माइन करें (Mine)' : 'Mine Assets'}</span>
              </button>
            </div>
          </div>

          {/* Asset Address Switcher Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {language === 'hi' ? 'नेटवर्क एड्रेस चुनें:' : 'Select Network Address:'}
              </span>
              <div className="flex gap-1.5">
                {(['BTC', 'USDT_TRC20', 'TRX', 'ETH'] as AssetType[]).map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAssetForAddress(asset)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
                      selectedAssetForAddress === asset
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {asset === 'USDT_TRC20' ? 'USDT (TRC-20)' : asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {selectedAssetForAddress} {t.walletAddress}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    {ASSET_CONFIGS[selectedAssetForAddress].networkBadge}
                  </span>
                </div>
                <div className="font-mono text-xs sm:text-sm text-slate-200 break-all select-all font-semibold">
                  {getAddressByAsset(selectedWallet, selectedAssetForAddress)}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(getAddressByAsset(selectedWallet, selectedAssetForAddress), selectedWallet.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition"
                >
                  {copiedAddress === selectedWallet.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.copyAddress}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    onOpenQr(
                      getAddressByAsset(selectedWallet, selectedAssetForAddress),
                      `${selectedWallet.name} - ${selectedAssetForAddress}`
                    )
                  }
                  className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs transition"
                  title={t.viewQr}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log for this Wallet */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.incomingLogs} ({walletTxs.length})
            </h4>

            {walletTxs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                {language === 'hi' ? 'इस वॉलेट के लिए अभी कोई ट्रांजेक्शन नहीं है। ऊपर से ट्रांसफर भेजें।' : 'No transactions recorded for this wallet yet. Send a transfer to see it appear.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {walletTxs.map((tx) => {
                  const isIncoming = tx.toWalletId === selectedWallet.id || tx.toAddress === getAddressByAsset(selectedWallet, tx.assetType);
                  return (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${
                          isIncoming ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">
                            {isIncoming ? (language === 'hi' ? 'प्राप्त हुआ (Incoming)' : 'Received') : (language === 'hi' ? 'भेजा गया (Sent)' : 'Sent')}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            TXID: {truncateHash(tx.txid, 6, 6)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-mono font-bold ${isIncoming ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {isIncoming ? '+' : '-'}{tx.amount} {tx.assetType}
                        </div>
                        <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>6/6 Confirmed</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Custom Wallet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {language === 'hi' ? 'नया सिम्युलेटेड वॉलेट जोड़ें' : 'Add New Simulated Wallet'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'नया वॉलेट बनाकर आप किसी भी पते पर ट्रांसफर टेस्ट कर सकते हैं और दोनों तरफ लाइव बैलेंस देख सकते हैं।'
                : 'Create an additional target wallet to test cross-wallet transfers and observe balance synchronization.'}
            </p>

            <form onSubmit={handleCreateWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'hi' ? 'वॉलेट का नाम' : 'Wallet Name'}
                </label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="e.g. MetaMask Hot Wallet / Safe Multisig"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold rounded-xl"
                >
                  {language === 'hi' ? 'वॉलेट बनाएं' : 'Create Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
