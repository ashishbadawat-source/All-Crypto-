import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Shield, Flame, Activity, ChevronDown, Check } from 'lucide-react';
import { Language } from '../types';

interface MarketTickerBarProps {
  language: Language;
  blockHeight: number;
  selectedNetwork: string;
  onSelectNetwork: (network: string) => void;
}

interface MarketItem {
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  decimals: number;
  icon: string;
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({
  language,
  blockHeight,
  selectedNetwork,
  onSelectNetwork
}) => {
  const [tickerData, setTickerData] = useState<MarketItem[]>([
    { symbol: 'BTC', pair: 'BTC/USDT', price: 94840.50, change24h: 3.82, decimals: 2, icon: '₿' },
    { symbol: 'USDT', pair: 'USDT/USD', price: 1.0002, change24h: 0.02, decimals: 4, icon: '₮' },
    { symbol: 'TRX', pair: 'TRX/USDT', price: 0.2845, change24h: 5.64, decimals: 4, icon: '⚡' },
    { symbol: 'ETH', pair: 'ETH/USDT', price: 3485.20, change24h: 2.15, decimals: 2, icon: 'Ξ' },
    { symbol: 'SOL', pair: 'SOL/USDT', price: 188.75, change24h: 4.40, decimals: 2, icon: '◎' },
  ]);

  const [gasFees, setGasFees] = useState({
    btc: 14, // sat/vB
    tron: 0.0035, // TRX/vB
    eth: 16 // Gwei
  });

  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [lastTickIdx, setLastTickIdx] = useState<number | null>(null);

  const networks = [
    { id: 'all', name: 'Multi-Chain Live', ping: '9ms', color: 'text-amber-400' },
    { id: 'btc', name: 'Bitcoin SegWit Mainnet', ping: '14ms', color: 'text-amber-400' },
    { id: 'tron', name: 'TRON TRC-20 High Speed', ping: '8ms', color: 'text-red-400' },
    { id: 'eth', name: 'Ethereum L1 Mainnet', ping: '18ms', color: 'text-indigo-400' },
  ];

  // Micro-fluctuation simulation for high realism
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * tickerData.length);
      const deltaPercent = (Math.random() - 0.49) * 0.08;
      
      setTickerData(prev => prev.map((item, idx) => {
        if (idx === randomIdx) {
          const newPrice = item.price * (1 + deltaPercent / 100);
          return {
            ...item,
            price: Number(newPrice.toFixed(item.decimals)),
            change24h: Number((item.change24h + (deltaPercent > 0 ? 0.01 : -0.01)).toFixed(2))
          };
        }
        return item;
      }));

      setLastTickIdx(randomIdx);
      setTimeout(() => setLastTickIdx(null), 800);
    }, 2800);

    return () => clearInterval(interval);
  }, [tickerData]);

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 text-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-10 gap-2 overflow-hidden">
        
        {/* Left: Live Tickers Marquee / List */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-800 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-300">LIVE MARKETS:</span>
          </div>

          {tickerData.map((item, idx) => (
            <div
              key={item.symbol}
              className={`flex items-center gap-1.5 shrink-0 transition-colors duration-300 ${
                lastTickIdx === idx ? 'bg-amber-400/10 px-1.5 py-0.5 rounded' : ''
              }`}
            >
              <span className="font-bold text-slate-400 font-mono">{item.pair}</span>
              <span className="font-mono font-bold text-white tracking-tight">
                ${item.price.toLocaleString(undefined, { minimumFractionDigits: item.decimals })}
              </span>
              <span
                className={`flex items-center font-mono text-[11px] font-bold ${
                  item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {item.change24h >= 0 ? `+${item.change24h}%` : `${item.change24h}%`}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Network Selector & Live Gas Rates */}
        <div className="hidden lg:flex items-center gap-4 shrink-0 pl-3 border-l border-slate-800 text-[11px] font-mono text-slate-400">
          
          {/* Gas & Fee indicators */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400" title="Bitcoin Mempool Fee">
              <span className="text-[10px] text-slate-500">BTC:</span>
              <span className="font-bold">{gasFees.btc} sat/vB</span>
            </span>

            <span className="flex items-center gap-1 text-red-400" title="TRON Energy Fee">
              <span className="text-[10px] text-slate-500">TRX:</span>
              <span className="font-bold">0 Energy</span>
            </span>

            <span className="flex items-center gap-1 text-indigo-400" title="Ethereum Gas Fee">
              <span className="text-[10px] text-slate-500">ETH:</span>
              <span className="font-bold">{gasFees.eth} Gwei</span>
            </span>
          </div>

          {/* Network Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 font-semibold transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{networks.find(n => n.id === selectedNetwork)?.name || 'Multi-Chain Live'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isNetworkDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 backdrop-blur-xl animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  Select Active Network
                </div>
                {networks.map(net => (
                  <button
                    key={net.id}
                    onClick={() => {
                      onSelectNetwork(net.id);
                      setIsNetworkDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 transition text-xs"
                  >
                    <span className={`font-semibold ${net.color}`}>{net.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{net.ping}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
