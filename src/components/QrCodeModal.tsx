import React, { useState } from 'react';
import { X, Copy, Check, QrCode as QrIcon, Download, Share2 } from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';
import { Language } from '../types';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface QrCodeModalProps {
  address: string;
  title: string;
  language: Language;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  address,
  title,
  language,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    playAudioFeedback('click');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fadeIn relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi' ? 'स्कैन करें या एड्रेस कॉपी करें' : 'Scan QR code or copy address to transfer'}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center py-2">
          <QrCodeSvg value={address} size={180} />
        </div>

        {/* Address Box */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            {language === 'hi' ? 'वॉलेट एड्रेस' : 'Wallet Address'}
          </span>
          <p className="font-mono text-xs text-slate-200 break-all select-all font-semibold">
            {address}
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              <span>{language === 'hi' ? 'कॉपी हो गया!' : 'Address Copied!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-950" />
              <span>{language === 'hi' ? 'एड्रेस कॉपी करें' : 'Copy Address'}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
