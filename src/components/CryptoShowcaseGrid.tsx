import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowRightLeft,
  ArrowDownUp,
  ExternalLink,
  ShieldCheck,
  Flame,
  Layers,
  DollarSign,
  Activity,
  Sparkles,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { Language, AssetType } from '../types';
import { ASSET_CONFIGS } from '../data/constants';
import { playAudioFeedback } from '../utils/cryptoUtils';

interface CryptoShowcaseGridProps {
  language: Language;
  onSelectAction: (tab: string, assetType?: AssetType) => void;
}

interface ShowcaseAsset {
  type: AssetType | 'SOL';
  symbol: string;
  name: string;
  nameHi: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: string;
  volume24h: string;
  network: string;
  speed: string;
  standard: string;
  contract: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  sparkline: number[];
  icon: string;
}

export const CryptoShowcaseGrid: React.FC<CryptoShowcaseGridProps> = ({
  language,
  onSelectAction
}) => {
  const [copiedContract, setCopiedContract] = useState<string | null>(null);

  const [cryptoList, setCryptoList] = useState<ShowcaseAsset[]>([
    {
      type: 'BTC',
      symbol: 'BTC',
      name: 'Bitcoin (SegWit Mainnet)',
      nameHi: 'बिटकॉइन (BTC SegWit)',
      price: 94840.50,
      change24h: 3.84,
      high24h: 96200.00,
      low24h: 92450.00,
      marketCap: '$1.88 Trillion',
      volume24h: '$48.5 Billion',
      network: 'Bitcoin Core P2P',
      speed: '~10 Mins / Instant Flash',
      standard: 'UTXO Native',
      contract: 'Native Layer-1 UTXO (SHA-256)',
      color: 'text-amber-400',
      glowColor: 'shadow-amber-500/20',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      bgGradient: 'from-amber-500/15 via-slate-900 to-slate-950',
      sparkline: [40, 42, 45, 43, 48, 52, 50, 56, 62, 59, 65, 70],
      icon: '₿'
    },
    {
      type: 'USDT_TRC20',
      symbol: 'USDT',
      name: 'Tether USD (TRC-20)',
      nameHi: 'यूएसडीटी (USDT TRC-20)',
      price: 1.0002,
      change24h: 0.02,
      high24h: 1.0012,
      low24h: 0.9998,
      marketCap: '$118.4 Billion',
      volume24h: '$64.2 Billion',
      network: 'TRON High-Speed Grid',
      speed: '< 3 Seconds',
      standard: 'TRC-20 Smart Token',
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      color: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/20',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      bgGradient: 'from-emerald-500/15 via-slate-900 to-slate-950',
      sparkline: [50, 50, 51, 50, 50, 50, 51, 50, 50, 51, 50, 50],
      icon: '₮'
    },
    {
      type: 'TRX',
      symbol: 'TRX',
      name: 'TRON Core Native',
      nameHi: 'ट्रॉन (TRX Core)',
      price: 0.2845,
      change24h: 5.62,
      high24h: 0.2920,
      low24h: 0.2680,
      marketCap: '$24.6 Billion',
      volume24h: '$3.8 Billion',
      network: 'TRON Super Representatives',
      speed: 'Instant (2,000 TPS)',
      standard: 'TRX Native Bandwidth',
      contract: 'TRON Mainnet Native Energy Core',
      color: 'text-red-400',
      glowColor: 'shadow-red-500/20',
      borderColor: 'border-red-500/40 hover:border-red-400',
      bgGradient: 'from-red-500/15 via-slate-900 to-slate-950',
      sparkline: [30, 32, 35, 33, 40, 44, 48, 52, 58, 62, 68, 74],
      icon: '⚡'
    },
    {
      type: 'ETH',
      symbol: 'ETH',
      name: 'Ethereum L1 Network',
      nameHi: 'इथेरियम (ETH Mainnet)',
      price: 3485.20,
      change24h: 2.15,
      high24h: 3560.00,
      low24h: 3390.00,
      marketCap: '$419.5 Billion',
      volume24h: '$28.4 Billion',
      network: 'Ethereum PoS Proof-of-Stake',
      speed: '~12 Seconds',
      standard: 'ERC-20 Virtual Machine',
      contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      color: 'text-indigo-400',
      glowColor: 'shadow-indigo-500/20',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      bgGradient: 'from-indigo-500/15 via-slate-900 to-slate-950',
      sparkline: [55, 54, 58, 56, 60, 62, 59, 64, 68, 67, 72, 75],
      icon: 'Ξ'
    }
  ]);

  // Live real-time micro fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * cryptoList.length);
      const deltaPct = (Math.random() - 0.48) * 0.06;

      setCryptoList(prev => prev.map((item, idx) => {
        if (idx === randomIdx) {
          const newPrice = item.price * (1 + deltaPct / 100);
          const dec = item.type === 'BTC' || item.type === 'ETH' ? 2 : 4;
          return {
            ...item,
            price: Number(newPrice.toFixed(dec)),
            change24h: Number((item.change24h + (deltaPct > 0 ? 0.01 : -0.01)).toFixed(2))
          };
        }
        return item;
      }));
    }, 2400);

    return () => clearInterval(interval);
  }, [cryptoList]);

  const handleCopyContract = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(id);
    playAudioFeedback('click');
    setTimeout(() => setCopiedContract(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Section with Real Crypto Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'hi' ? 'टॉप क्रिप्टोकरेंसी लाइव मार्केट & शोकेस' : 'Top Tier Cryptocurrencies & 300-Day Flash Assets'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                300-DAY VALIDITY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'Bitcoin, USDT (TRC-20), TRON एवं Ethereum के लिए लाइव रियल-टाइम भाव, स्वैप और 300-दिन फ्लैश माइनिंग'
                : 'Real-time market rates, instant liquidity, and 300-day time-lock flash asset generators'}
            </p>
          </div>
        </div>

        {/* 300-Day Security Stamp */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">300-DAY TIMELOCK VERIFIED</span>
        </div>
      </div>

      {/* 4-Column Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cryptoList.map((asset) => {
          const isBtc = asset.type === 'BTC';
          const isUsdt = asset.type === 'USDT_TRC20';
          const isTrx = asset.type === 'TRX';
          const isEth = asset.type === 'ETH';

          return (
            <div
              key={asset.symbol}
              className={`bg-gradient-to-b ${asset.bgGradient} border ${asset.borderColor} rounded-2xl p-5 shadow-xl hover:${asset.glowColor} transition-all duration-300 relative overflow-hidden flex flex-col justify-between space-y-4 group`}
            >
              {/* Card Top: Icon, Symbol, Name & 24h badge */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 p-0.5 shadow-inner flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition">
                      <span className={asset.color}>{asset.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-base tracking-tight">{asset.symbol}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {asset.standard}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium truncate max-w-[130px]">
                        {language === 'hi' ? asset.nameHi : asset.name}
                      </p>
                    </div>
                  </div>

                  {/* 24h Change Pill */}
                  <div
                    className={`flex items-center px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                      asset.change24h >= 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {asset.change24h >= 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                    {language === 'hi' ? 'लाइव मार्केट भाव' : 'Live Mark Price'}
                  </div>
                  <div className="flex items-baseline justify-between gap-2 mt-0.5">
                    <span className="font-mono text-2xl font-extrabold text-white tracking-tight">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: isBtc || isEth ? 2 : 4 })}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">● Real-time</span>
                  </div>
                </div>

                {/* Mini SVG Sparkline Trend */}
                <div className="mt-2 h-10 w-full pt-1">
                  <svg viewBox="0 0 120 30" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={asset.change24h >= 0 ? '#10b981' : '#f43f5e'}
                      strokeWidth="2"
                      points={asset.sparkline.map((val, idx) => `${idx * 10},${30 - (val / 80) * 25}`).join(' ')}
                    />
                  </svg>
                </div>

                {/* Key Metrics Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">24h High</span>
                    <span className="text-slate-200 font-semibold">${asset.high24h.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">24h Low</span>
                    <span className="text-slate-200 font-semibold">${asset.low24h.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Market Cap</span>
                    <span className="text-slate-300 font-medium">{asset.marketCap}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Block Speed</span>
                    <span className="text-cyan-400 font-semibold">{asset.speed}</span>
                  </div>
                </div>

                {/* Contract / Hash Inspector */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 truncate max-w-[170px]">{asset.contract}</span>
                  <button
                    onClick={() => handleCopyContract(asset.contract, asset.symbol)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    title="Copy Contract Address"
                  >
                    {copiedContract === asset.symbol ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 1-Click Interactive Action Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    playAudioFeedback('click');
                    if (asset.type !== 'SOL') {
                      onSelectAction('generator', asset.type as AssetType);
                    } else {
                      onSelectAction('generator', 'BTC');
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition group-hover:scale-[1.01]"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{language === 'hi' ? `300-दिन Flash ${asset.symbol} जनरेट करें` : `Mint 300-Day ${asset.symbol}`}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      playAudioFeedback('click');
                      if (asset.type !== 'SOL') {
                        onSelectAction('transfer', asset.type as AssetType);
                      } else {
                        onSelectAction('transfer', 'BTC');
                      }
                    }}
                    className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'hi' ? 'ट्रांसफर' : 'Send'}</span>
                  </button>

                  <button
                    onClick={() => {
                      playAudioFeedback('click');
                      onSelectAction('swap');
                    }}
                    className="py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <ArrowDownUp className="w-3.5 h-3.5 text-orange-400" />
                    <span>{language === 'hi' ? 'स्वैप' : 'Swap'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
