import React from 'react';
import { Clock, ShieldAlert, Zap, AlertTriangle, CheckCircle2, RotateCcw, Play, FastForward, Info } from 'lucide-react';
import { Language, Wallet } from '../types';
import { translations } from '../data/translations';
import { calculateRemainingTime, playAudioFeedback } from '../utils/cryptoUtils';

interface ValidityLifecycleViewerProps {
  initialExpiryTimestamp: number;
  simulatedDays: number;
  onSetSimulatedDays: (days: number) => void;
  language: Language;
  wallets: Wallet[];
}

export const ValidityLifecycleViewer: React.FC<ValidityLifecycleViewerProps> = ({
  initialExpiryTimestamp,
  simulatedDays,
  onSetSimulatedDays,
  language,
  wallets
}) => {
  const t = translations[language];
  const timeData = calculateRemainingTime(initialExpiryTimestamp, simulatedDays);

  const effectiveDaysRemaining = Math.max(0, 200 - simulatedDays);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onSetSimulatedDays(val);
    if (val >= 200) {
      playAudioFeedback('expire');
    } else {
      playAudioFeedback('click');
    }
  };

  const handlePresetDays = (days: number) => {
    onSetSimulatedDays(days);
    if (days >= 200) {
      playAudioFeedback('expire');
    } else {
      playAudioFeedback('click');
    }
  };

  // State condition
  let statusBadge = {
    text: language === 'hi' ? 'सक्रिय और वैध' : 'Active & Valid',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400'
  };

  if (simulatedDays >= 200) {
    statusBadge = {
      text: language === 'hi' ? 'समाप्त — क्रिप्टो गायब हो गया' : 'Expired — Assets Pruned',
      color: 'bg-red-500/10 text-red-400 border-red-500/30',
      dot: 'bg-red-400'
    };
  } else if (simulatedDays >= 185) {
    statusBadge = {
      text: language === 'hi' ? 'शीघ्र समाप्त (15 दिन से कम)' : 'Expiring Soon (< 15 Days)',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400'
    };
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.lifecycleTitle}
            </h2>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></span>
            {statusBadge.text}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {t.lifecycleSubtitle}
        </p>
      </div>

      {/* Main 200-Day Timeline Visualizer */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-6">
        
        {/* Timeline Header with big numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              {language === 'hi' ? 'कुल निर्धारित वैलिडिटी' : 'Total Fixed Validity'}
            </span>
            <span className="text-2xl font-mono font-extrabold text-amber-400">200 {language === 'hi' ? 'दिन' : 'Days'}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">17,280,000 Seconds</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              {language === 'hi' ? 'सिम्युलेटेड बीता हुआ समय' : 'Simulated Elapsed Time'}
            </span>
            <span className="text-2xl font-mono font-extrabold text-slate-200">
              Day {simulatedDays}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
              {((simulatedDays / 200) * 100).toFixed(1)}% of lifecycle
            </span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            effectiveDaysRemaining === 0
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              {language === 'hi' ? 'शेष वैलिडिटी' : 'Remaining Validity'}
            </span>
            <span className={`text-2xl font-mono font-extrabold ${
              effectiveDaysRemaining === 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {effectiveDaysRemaining} {language === 'hi' ? 'दिन' : 'Days'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
              {effectiveDaysRemaining === 0 ? (language === 'hi' ? 'गायब हो चुका है' : 'PRUNED / DISAPPEARED') : (language === 'hi' ? 'ट्रांसफर करने योग्य' : 'Spendable on Network')}
            </span>
          </div>

        </div>

        {/* Visual Progress Bar with milestones */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Day 0 (Minted)</span>
            <span>Day 50</span>
            <span>Day 100 (Half-Life)</span>
            <span>Day 150</span>
            <span className="text-red-400 font-bold">Day 200 (Auto-Burn)</span>
          </div>

          <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                simulatedDays >= 200
                  ? 'bg-red-500'
                  : simulatedDays >= 185
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, (simulatedDays / 200) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>100% {language === 'hi' ? 'पूर्ण क्षमता' : 'Active Balance'}</span>
            <span>{language === 'hi' ? 'वर्तमान स्थिति:' : 'Status:'} {timeData.percentageRemaining.toFixed(1)}% {language === 'hi' ? 'शेष' : 'Remaining'}</span>
            <span>0% ({language === 'hi' ? 'शून्य / गायब' : 'Zero Balance'})</span>
          </div>
        </div>

        {/* Time Travel Fast Forward Interactive Slider */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FastForward className="w-4 h-4 text-cyan-400" />
              <span>{t.timeTravelSlider}</span>
            </label>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/30">
              {language === 'hi' ? 'दिन' : 'Day'}: {simulatedDays} / 200
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="205"
            value={simulatedDays}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          {/* Quick preset buttons for testing */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold self-center">
              {language === 'hi' ? 'त्वरित टेस्ट पॉइंट्स:' : 'Test Points:'}
            </span>
            <button
              onClick={() => handlePresetDays(0)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 0 (Fresh)
            </button>
            <button
              onClick={() => handlePresetDays(50)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 50
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 50
            </button>
            <button
              onClick={() => handlePresetDays(100)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 100
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 100 (50%)
            </button>
            <button
              onClick={() => handlePresetDays(195)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 195
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 195 (Warning)
            </button>
            <button
              onClick={() => handlePresetDays(200)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 200
                  ? 'bg-red-500/20 text-red-300 border border-red-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 200 (Expired)
            </button>
            <button
              onClick={() => handlePresetDays(205)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                simulatedDays === 205
                  ? 'bg-red-500/20 text-red-300 border border-red-400'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              Day 205+ (Disappeared)
            </button>
          </div>

        </div>

      </div>

      {/* Technical Protocol Explanation Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{t.howItWorks}</span>
        </div>

        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.decayPoint1}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.decayPoint2}</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t.decayPoint3}</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
