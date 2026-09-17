import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Copy, Check, Printer, Download, ExternalLink, X, FileText, QrCode } from 'lucide-react';
import { Transaction, Language } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { QrCodeSvg } from './QrCodeSvg';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface CryptoReceiptModalProps {
  transaction: Transaction;
  language: Language;
  onClose: () => void;
}

export const CryptoReceiptModal: React.FC<CryptoReceiptModalProps> = ({
  transaction,
  language,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const cfg = ASSET_CONFIGS[transaction.assetType];

  const handleCopyTxid = () => {
    navigator.clipboard.writeText(transaction.txid);
    setCopied(true);
    playAudioFeedback('click');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const expiryDate = new Date(transaction.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn relative my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Official Header */}
        <div className="text-center space-y-1.5 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 mx-auto shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400 font-bold text-lg">
              ₿
            </div>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {language === 'hi' ? 'आधिकारिक क्रिप्टोग्राफिक रसीद (Receipt)' : 'Official Blockchain Transfer Voucher'}
          </h2>
          <p className="text-[11px] font-mono text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED ON-CHAIN (6/6 CONFIRMATIONS)</span>
          </p>
        </div>

        {/* Amount Big Highlight Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1 relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {language === 'hi' ? 'ट्रांसफर की गई कुल राशि' : 'Total Transferred Amount'}
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {transaction.amount.toLocaleString()} <span className={cfg.color}>{cfg.symbol}</span>
          </div>
          <div className="text-xs font-mono text-slate-500">
            ≈ ${(transaction.amount * cfg.usdRate).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
          </div>

          {/* 300-Day Validity Holographic Watermark Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>300-DAY TIMELOCK VALID UNTIL: {expiryDate}</span>
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5 text-xs font-mono">
          
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Transaction Hash (TXID):</span>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-slate-300 break-all text-[11px] font-semibold">{transaction.txid}</span>
              <button
                onClick={handleCopyTxid}
                className="shrink-0 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                title="Copy TXID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">From Sender:</span>
              <span className="text-slate-300 truncate block text-[11px]">{transaction.fromAddress}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">To Recipient:</span>
              <span className="text-slate-300 truncate block text-[11px]">{transaction.toAddress}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[10px]">
            <div>
              <span className="text-slate-500 block uppercase">Block Height</span>
              <span className="text-slate-200 font-bold">#{transaction.blockHeight}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase">Network Fee</span>
              <span className="text-amber-400 font-bold">{transaction.fee} {transaction.feeAsset}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase">Standard</span>
              <span className="text-cyan-400 font-bold">{cfg.standard}</span>
            </div>
          </div>

        </div>

        {/* QR & Verification Box */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              {language === 'hi' ? 'क्रिप्टोग्राफिक सत्यापन QR' : 'Cryptographic Verification'}
            </span>
            <p className="text-[11px] text-slate-400 max-w-[240px]">
              {language === 'hi' ? 'इस QR कोड को किसी भी ब्लॉकचेन स्कैनर से सत्यापित किया जा सकता है।' : 'Scan to inspect live consensus verification state.'}
            </p>
          </div>
          <div className="shrink-0 bg-white p-1.5 rounded-lg">
            <QrCodeSvg value={transaction.txid} size={54} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रिंट रसीद' : 'Print Voucher'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-xl transition"
          >
            {language === 'hi' ? 'पूर्ण हुआ' : 'Done'}
          </button>
        </div>

      </div>
    </div>
  );
};
