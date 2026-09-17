import React, { useState } from 'react';
import { Search, Database, CheckCircle2, Clock, ExternalLink, Copy, Check, Filter, Layers, ArrowRight } from 'lucide-react';
import { Transaction, Language, AssetType } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { translations } from '../data/translations';
import { truncateHash, playAudioFeedback } from '../utils/cryptoUtils';

interface BlockchainExplorerProps {
  transactions: Transaction[];
  language: Language;
  blockHeight: number;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  transactions,
  language,
  blockHeight
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesAsset = selectedAssetFilter === 'ALL' || tx.assetType === selectedAssetFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tx.txid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.blockHeight.toString().includes(searchQuery);

    return matchesAsset && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxid(id);
    playAudioFeedback('click');
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.explorerTitle}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            Tip Height: #{blockHeight.toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t.explorerSubtitle}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'BTC', 'USDT_TRC20', 'TRX', 'ETH'].map((asset) => (
            <button
              key={asset}
              onClick={() => {
                setSelectedAssetFilter(asset);
                playAudioFeedback('click');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedAssetFilter === asset
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {asset === 'USDT_TRC20' ? 'USDT' : asset}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
            {language === 'hi' ? 'कोई ट्रांजेक्शन नहीं मिला। ऊपर से नया ट्रांसफर करें।' : 'No transactions matching query.'}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const config = ASSET_CONFIGS[tx.assetType];
            const dateStr = new Date(tx.timestamp).toLocaleTimeString();

            return (
              <div
                key={tx.id}
                className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 sm:p-4 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  
                  {/* Left: TXID & Asset */}
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                      {config.symbol}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200">
                      <span>TXID:</span>
                      <span className="font-semibold text-cyan-400 truncate max-w-[140px] sm:max-w-[220px]">
                        {tx.txid}
                      </span>
                      <button
                        onClick={() => handleCopy(tx.txid, tx.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Copy TXID"
                      >
                        {copiedTxid === tx.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right: Status & Confirmations */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 text-[11px] font-mono">{dateStr}</span>
                    <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {tx.confirmations} Confirmations
                    </span>
                  </div>

                </div>

                {/* Sender -> Recipient Address Visual Route */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="sm:col-span-5 text-slate-400 truncate">
                    <span className="text-[10px] uppercase text-slate-500 block">From Address:</span>
                    <span className="text-slate-300">{truncateHash(tx.fromAddress, 10, 8)}</span>
                  </div>

                  <div className="sm:col-span-2 text-center text-slate-500 flex justify-center">
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="sm:col-span-5 text-slate-400 truncate">
                    <span className="text-[10px] uppercase text-slate-500 block">To Address:</span>
                    <span className="text-emerald-300 font-semibold">{truncateHash(tx.toAddress, 10, 8)}</span>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-800/60 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white font-mono">
                      Amount: {tx.amount} {config.symbol}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Fee: {tx.fee} {tx.feeAsset}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      200d TTL Smart Lock
                    </span>
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                    >
                      {language === 'hi' ? 'विस्तृत विवरण देखें' : 'Inspect Raw Data'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Raw Data Inspection Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {language === 'hi' ? 'ट्रांजेक्शन रॉ डेटा (On-Chain Script)' : 'Raw Transaction Inspector'}
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-80 overflow-y-auto">
              <div>
                <span className="text-slate-500 block">TXID HASH:</span>
                <span className="text-cyan-300 break-all">{selectedTx.txid}</span>
              </div>
              <div>
                <span className="text-slate-500 block">BLOCK HEIGHT:</span>
                <span className="text-slate-200">#{selectedTx.blockHeight}</span>
              </div>
              <div>
                <span className="text-slate-500 block">SCRIPT OP_CODES:</span>
                <span className="text-amber-300 break-all">
                  OP_DUP OP_HASH160 0x71c3... OP_EQUALVERIFY OP_CHECKLOCKTIMEVERIFY 200_DAYS_TTL OP_CHECKSIG
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">LOCKTIME TIMESTAMP:</span>
                <span className="text-slate-300">{new Date(selectedTx.expiresAt).toUTCString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CONFIRMATION STATE:</span>
                <span className="text-emerald-400">6 Blocks (Irreversible in Sandbox)</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
