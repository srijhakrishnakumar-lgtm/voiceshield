import React from 'react';
import { Waves, Activity, Cpu, CheckCircle2 } from 'lucide-react';

export default function MultiLayerBreakdown({ layerAScore = 0, layerBScore = 0 }) {
  // Layer A color scaling
  const getBarColor = (score) => {
    if (score < 35) return 'bg-emerald-500 text-emerald-400';
    if (score <= 65) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  };

  const isDampeningActive = layerBScore < 40.0;

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Multi-Layer Detection Signal Breakdown
        </h3>
        {isDampeningActive && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            PROSODY VALIDATED (-30% MIC NOISE DAMPENING)
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Layer A Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              Layer A: Acoustic & Spectral DSP Engine
            </span>
            <span className={`font-extrabold ${getBarColor(layerAScore).split(' ')[1]}`}>
              {layerAScore.toFixed(1)} / 100
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(layerAScore).split(' ')[0]}`}
              style={{ width: `${Math.max(2, Math.min(100, layerAScore))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Analyzes MFCC delta variance, spectral flatness (vocoder noise floor), spectral flux, and high-frequency energy ratio (&gt;4kHz).
          </p>
        </div>

        {/* Layer B Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Layer B: Prosody & Micro-Tremor Behavioral Engine
            </span>
            <span className={`font-extrabold ${getBarColor(layerBScore).split(' ')[1]}`}>
              {layerBScore.toFixed(1)} / 100
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(layerBScore).split(' ')[0]}`}
              style={{ width: `${Math.max(2, Math.min(100, layerBScore))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Measures pitch (F0) std, organic jitter micro-vibrations, shimmer amplitude variations, and robotic pause regularity.
          </p>
        </div>
      </div>
    </div>
  );
}
