import React, { useState, useEffect } from 'react';
import { Database, Box, Cpu, HardDrive, ArrowUpRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Language, Transaction } from '../types';

interface MempoolVisualizerProps {
  language: Language;
  blockHeight: number;
  transactions: Transaction[];
}

interface BlockItem {
  id: string;
  height: number;
  hash: string;
  txCount: number;
  sizeMb: number;
  miner: string;
  feeRate: number;
  timeAgo: string;
  color: string;
}

export const MempoolVisualizer: React.FC<MempoolVisualizerProps> = ({
  language,
  blockHeight,
  transactions
}) => {
  const [blocks, setBlocks] = useState<BlockItem[]>(() => [
    {
      id: `block-${blockHeight}`,
      height: blockHeight,
      hash: '00000000000000000001a8f9c4e2b0d7e6f8a1c3d5e7b9a0c2e4f6a8b0c2d4e6',
      txCount: 3412,
      sizeMb: 1.58,
      miner: 'Foundry USA Pool',
      feeRate: 14,
      timeAgo: 'Just now',
      color: 'from-amber-500/30 to-orange-600/30 border-amber-500/50'
    },
    {
      id: `block-${blockHeight - 1}`,
      height: blockHeight - 1,
      hash: '00000000000000000002b7e8d3c1a9f6e5d7c8b0a2f4e6d8c0b2a4f6e8d0c2b4',
      txCount: 2980,
      sizeMb: 1.42,
      miner: 'AntPool Mining',
      feeRate: 16,
      timeAgo: '9 mins ago',
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40'
    },
    {
      id: `block-${blockHeight - 2}`,
      height: blockHeight - 2,
      hash: '00000000000000000003c6d7e2b0f8e5d4c6b7a9f1e3d5c7b9a1f3e5d7c9b1a3',
      txCount: 3120,
      sizeMb: 1.49,
      miner: 'F2Pool Global',
      feeRate: 13,
      timeAgo: '18 mins ago',
      color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40'
    },
    {
      id: `block-${blockHeight - 3}`,
      height: blockHeight - 3,
      hash: '00000000000000000004d5c6f1a9e7d4c3b5a6f8e0d2c4b6a8f0e2d4c6b8a0f2',
      txCount: 2840,
      sizeMb: 1.36,
      miner: 'Binance Pool L1',
      feeRate: 15,
      timeAgo: '27 mins ago',
      color: 'from-purple-500/20 to-indigo-600/20 border-purple-500/40'
    }
  ]);

  // Update blocks when blockHeight changes without creating duplicate heights
  useEffect(() => {
    setBlocks(prev => {
      // If the top block already matches the current height, do not duplicate
      if (prev.length > 0 && prev[0].height === blockHeight) {
        return prev;
      }

      const newBlock: BlockItem = {
        id: `block-${blockHeight}-${Date.now()}`,
        height: blockHeight,
        hash: `0000000000000000000${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
        txCount: Math.floor(Math.random() * 800) + 2800,
        sizeMb: Number((1.2 + Math.random() * 0.45).toFixed(2)),
        miner: ['Foundry USA Pool', 'AntPool Mining', 'F2Pool Global', 'Tron SR Node'][Math.floor(Math.random() * 4)],
        feeRate: Math.floor(Math.random() * 6) + 12,
        timeAgo: 'Just now',
        color: 'from-amber-500/30 to-orange-600/30 border-amber-500/50'
      };

      // Filter out any existing block with the same height to ensure unique keys
      const filtered = prev.filter(b => b.height !== blockHeight);
      return [newBlock, ...filtered.slice(0, 3)];
    });
  }, [blockHeight]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{language === 'hi' ? 'लाइव ब्लॉकचेन मेमपूल व ब्लॉक स्ट्रीम' : 'Live Mempool & Block Visualizer'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                P2P CONSENSUS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'नोड्स और माइनर पूल्स द्वारा लाइव कन्फर्म किए गए ब्लॉक्स' : 'Real-time validated blocks and cryptographic hashes'}
            </p>
          </div>
        </div>

        {/* Mempool Stats Badge */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Mempool Size</span>
            <span className="font-bold text-amber-300">14.8 MB (34,120 txs)</span>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:block">
            <span className="text-[10px] text-slate-500 block uppercase">Hashrate</span>
            <span className="font-bold text-emerald-400">682.4 EH/s</span>
          </div>
        </div>
      </div>

      {/* Visual Live Stream Block Train */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className={`bg-gradient-to-b ${block.color} bg-slate-950 p-4 rounded-xl border space-y-3 relative overflow-hidden transition-all hover:scale-[1.02] shadow-lg`}
          >
            {/* Block Height & Live Tag */}
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                #{block.height.toLocaleString()}
              </span>
              {idx === 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 animate-pulse font-mono">
                  LATEST BLOCK
                </span>
              )}
            </div>

            {/* Block Stats */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Transactions:</span>
                <span className="text-white font-bold">{block.txCount} txs</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Block Size:</span>
                <span className="text-slate-300 font-semibold">{block.sizeMb} MB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Avg Fee Rate:</span>
                <span className="text-amber-400 font-bold">~{block.feeRate} sat/vB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Miner / Pool:</span>
                <span className="text-cyan-300 font-semibold truncate max-w-[110px]">{block.miner}</span>
              </div>
            </div>

            {/* Hash Display */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Block Hash:</span>
              <p className="font-mono text-[10px] text-slate-400 truncate hover:text-slate-200">
                {block.hash}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
