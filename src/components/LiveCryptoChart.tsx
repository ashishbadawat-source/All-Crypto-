import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, Activity, ArrowUpRight, ArrowDownRight, Layers, Maximize2 } from 'lucide-react';
import { Language, AssetType } from '../types';
import { ASSET_CONFIGS } from '../data/constants';

interface LiveCryptoChartProps {
  language: Language;
}

interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradeTapeItem {
  id: string;
  price: number;
  amount: number;
  time: string;
  side: 'buy' | 'sell';
}

export const LiveCryptoChart: React.FC<LiveCryptoChartProps> = ({ language }) => {
  const [selectedAsset, setSelectedAsset] = useState<AssetType>('BTC');
  const [timeframe, setTimeframe] = useState<string>('1H');
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');

  // Base price configurations
  const assetBasePrices: Record<AssetType, number> = {
    BTC: 94850,
    USDT_TRC20: 1.0002,
    TRX: 0.2845,
    ETH: 3485
  };

  const currentBasePrice = assetBasePrices[selectedAsset];

  // Dynamic live price & stats
  const [livePrice, setLivePrice] = useState<number>(currentBasePrice);
  const [liveDelta, setLiveDelta] = useState<number>(3.84);
  const [liveHigh, setLiveHigh] = useState<number>(currentBasePrice * 1.025);
  const [liveLow, setLiveLow] = useState<number>(currentBasePrice * 0.978);
  const [liveVolume, setLiveVolume] = useState<string>('$42.84B');
  const [hoveredPoint, setHoveredPoint] = useState<CandlePoint | null>(null);

  // Simulated recent trades tape
  const [recentTrades, setRecentTrades] = useState<TradeTapeItem[]>([
    { id: '1', price: currentBasePrice, amount: 0.45, time: '14:24:02', side: 'buy' },
    { id: '2', price: currentBasePrice * 0.9998, amount: 1.20, time: '14:24:01', side: 'sell' },
    { id: '3', price: currentBasePrice * 1.0001, amount: 0.85, time: '14:23:59', side: 'buy' },
    { id: '4', price: currentBasePrice * 1.0002, amount: 3.50, time: '14:23:58', side: 'buy' },
    { id: '5', price: currentBasePrice * 0.9999, amount: 0.15, time: '14:23:55', side: 'sell' },
    { id: '6', price: currentBasePrice * 1.0004, amount: 2.10, time: '14:23:51', side: 'buy' },
  ]);

  // Generate synthetic candles based on timeframe & asset
  const candleData: CandlePoint[] = useMemo(() => {
    const points: CandlePoint[] = [];
    const count = 28;
    let base = currentBasePrice * 0.96;
    const volatility = selectedAsset === 'BTC' ? 450 : selectedAsset === 'ETH' ? 25 : selectedAsset === 'TRX' ? 0.004 : 0.0001;

    for (let i = 0; i < count; i++) {
      const delta = (Math.sin(i * 0.4) + (Math.random() - 0.48) * 1.2) * volatility;
      const open = base;
      const close = base + delta;
      const high = Math.max(open, close) + Math.random() * volatility * 0.8;
      const low = Math.min(open, close) - Math.random() * volatility * 0.8;
      const volume = Math.floor(Math.random() * 800) + 200;

      const hour = (10 + Math.floor(i / 2)) % 24;
      const min = (i % 2) * 30;
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

      points.push({
        time: timeStr,
        open,
        high,
        low,
        close,
        volume
      });

      base = close;
    }
    return points;
  }, [selectedAsset, currentBasePrice, timeframe]);

  // Update live price in sync with selected asset
  useEffect(() => {
    setLivePrice(assetBasePrices[selectedAsset]);
    setLiveHigh(assetBasePrices[selectedAsset] * 1.025);
    setLiveLow(assetBasePrices[selectedAsset] * 0.978);
  }, [selectedAsset]);

  // Simulated live trade stream & candle twitching
  useEffect(() => {
    const interval = setInterval(() => {
      const isBuy = Math.random() > 0.45;
      const deltaPct = (Math.random() - 0.48) * 0.05;
      const newPrice = livePrice * (1 + deltaPct / 100);
      const dec = selectedAsset === 'BTC' || selectedAsset === 'ETH' ? 2 : 4;
      const roundedPrice = Number(newPrice.toFixed(dec));
      
      setLivePrice(roundedPrice);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const newTrade: TradeTapeItem = {
        id: Date.now().toString(),
        price: roundedPrice,
        amount: Number((Math.random() * (selectedAsset === 'BTC' ? 2.5 : selectedAsset === 'TRX' ? 5000 : 100)).toFixed(3)),
        time: timeStr,
        side: isBuy ? 'buy' : 'sell'
      };

      setRecentTrades(prev => [newTrade, ...prev.slice(0, 7)]);
    }, 2200);

    return () => clearInterval(interval);
  }, [livePrice, selectedAsset]);

  // Calculate SVG dimensions
  const svgWidth = 640;
  const svgHeight = 240;
  const paddingY = 20;

  const minPrice = Math.min(...candleData.map(c => c.low));
  const maxPrice = Math.max(...candleData.map(c => c.high));
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    return svgHeight - paddingY - ((val - minPrice) / priceRange) * (svgHeight - paddingY * 2);
  };

  const candleWidth = (svgWidth / candleData.length) * 0.65;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
      
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        
        {/* Asset Pair Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['BTC', 'USDT_TRC20', 'TRX', 'ETH'] as AssetType[]).map(asset => {
            const cfg = ASSET_CONFIGS[asset];
            const isSelected = selectedAsset === asset;
            return (
              <button
                key={asset}
                onClick={() => setSelectedAsset(asset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={cfg.color}>{cfg.symbol}</span>
                <span className="text-[10px] text-slate-500">/USDT</span>
              </button>
            );
          })}
        </div>

        {/* Live Market Bar Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">
              {language === 'hi' ? 'लाइव कीमत' : 'Mark Price'}
            </span>
            <span className="text-base font-bold text-white tracking-tight">
              ${livePrice.toLocaleString(undefined, { minimumFractionDigits: selectedAsset === 'BTC' ? 2 : 4 })}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-500 block uppercase">24h Change</span>
            <span className="text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +{liveDelta}%
            </span>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] text-slate-500 block uppercase">24h High</span>
            <span className="text-slate-300 font-semibold">${liveHigh.toFixed(2)}</span>
          </div>

          <div className="hidden md:block">
            <span className="text-[10px] text-slate-500 block uppercase">24h Low</span>
            <span className="text-slate-300 font-semibold">${liveLow.toFixed(2)}</span>
          </div>

          <div className="hidden lg:block">
            <span className="text-[10px] text-slate-500 block uppercase">24h Volume</span>
            <span className="text-slate-300 font-semibold">{liveVolume}</span>
          </div>
        </div>

        {/* Timeframes & Type switchers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {['15m', '1H', '4H', '1D', '300D'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition font-bold ${
                  timeframe === tf
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setChartType(chartType === 'candle' ? 'area' : 'candle')}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition"
            title="Toggle Chart Type"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Grid: Chart Canvas (Left) + Live Order Book / Trade Tape (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Chart Canvas Area (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800 relative">
          
          {/* Hovered Price Info Tooltip Header */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span>O: <span className="text-slate-200">{(hoveredPoint?.open || livePrice).toFixed(2)}</span></span>
              <span>H: <span className="text-emerald-400">{(hoveredPoint?.high || liveHigh).toFixed(2)}</span></span>
              <span>L: <span className="text-rose-400">{(hoveredPoint?.low || liveLow).toFixed(2)}</span></span>
              <span>C: <span className="text-slate-200">{(hoveredPoint?.close || livePrice).toFixed(2)}</span></span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REAL-TIME WEBSOCKET FEED
            </span>
          </div>

          {/* SVG Candlestick & Area Graphic */}
          <div className="relative w-full h-[240px] pt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="60" x2={svgWidth} y2="60" stroke="#334155" strokeDasharray="3,3" strokeOpacity="0.3" />
              <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="#334155" strokeDasharray="3,3" strokeOpacity="0.3" />
              <line x1="0" y1="180" x2={svgWidth} y2="180" stroke="#334155" strokeDasharray="3,3" strokeOpacity="0.3" />

              {/* AREA CHART MODE */}
              {chartType === 'area' && (
                <>
                  <path
                    d={`M 0,${getY(candleData[0].close)} ${candleData.map((c, idx) => `L ${(idx / (candleData.length - 1)) * svgWidth},${getY(c.close)}`).join(' ')} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`}
                    fill="url(#areaGradient)"
                  />
                  <path
                    d={`M 0,${getY(candleData[0].close)} ${candleData.map((c, idx) => `L ${(idx / (candleData.length - 1)) * svgWidth},${getY(c.close)}`).join(' ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                </>
              )}

              {/* CANDLESTICK MODE */}
              {chartType === 'candle' && candleData.map((c, idx) => {
                const xCenter = (idx + 0.5) * (svgWidth / candleData.length);
                const isBullish = c.close >= c.open;
                const candleColor = isBullish ? '#10b981' : '#f43f5e';
                const bodyTop = getY(Math.max(c.open, c.close));
                const bodyHeight = Math.max(2, Math.abs(getY(c.open) - getY(c.close)));

                return (
                  <g
                    key={idx}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredPoint(c)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Wick Line */}
                    <line
                      x1={xCenter}
                      y1={getY(c.high)}
                      x2={xCenter}
                      y2={getY(c.low)}
                      stroke={candleColor}
                      strokeWidth="1.5"
                    />
                    {/* Candle Body */}
                    <rect
                      x={xCenter - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Live Current Price Horizontal Cursor Line */}
              <line
                x1="0"
                y1={getY(livePrice)}
                x2={svgWidth}
                y2={getY(livePrice)}
                stroke="#38bdf8"
                strokeDasharray="4,4"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
            <span>{candleData[0]?.time}</span>
            <span>{candleData[Math.floor(candleData.length / 2)]?.time}</span>
            <span>{candleData[candleData.length - 1]?.time} (Now)</span>
          </div>

        </div>

        {/* Right Column: Live Order Book & Real-time Trades (1 Col) */}
        <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs flex flex-col justify-between">
          
          {/* Order Book Header */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi' ? 'लाइव ट्रेड्स' : 'Market Trades'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">● LIVE</span>
            </div>

            <div className="grid grid-cols-3 text-[10px] text-slate-500 pt-2 pb-1 font-bold">
              <span>Price(USDT)</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Time</span>
            </div>

            {/* Trades Stream */}
            <div className="space-y-1.5 overflow-hidden">
              {recentTrades.map(trade => (
                <div key={trade.id} className="grid grid-cols-3 text-[11px] items-center hover:bg-slate-900/80 px-1 py-0.5 rounded transition">
                  <span className={`font-bold ${trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.price.toFixed(selectedAsset === 'BTC' ? 2 : 4)}
                  </span>
                  <span className="text-right text-slate-300 font-medium">
                    {trade.amount}
                  </span>
                  <span className="text-right text-slate-500 text-[10px]">
                    {trade.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Depth Ratio Bar */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">BUY 64%</span>
              <span className="text-rose-400 font-bold">SELL 36%</span>
            </div>
            <div className="h-1.5 w-full bg-rose-500/30 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '64%' }}></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
