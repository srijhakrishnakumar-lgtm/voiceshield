import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Lock } from 'lucide-react';

export default function RiskGauge({ compositeScore = 0, verdict = 'LOW', action = 'PASS' }) {
  // Normalize score between 0 and 100
  const score = Math.max(0, Math.min(100, compositeScore));

  // Determine theme colors based on verdict / score threshold
  const getTheme = () => {
    if (score < 35) {
      return {
        color: '#10b981', // Emerald
        bgClass: 'bg-emerald-950/60',
        borderClass: 'border-emerald-500/50',
        textClass: 'text-emerald-400',
        glowClass: 'cyber-glow-emerald',
        icon: ShieldCheck,
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      };
    }
    if (score <= 65) {
      return {
        color: '#f59e0b', // Amber
        bgClass: 'bg-amber-950/60',
        borderClass: 'border-amber-500/50',
        textClass: 'text-amber-400',
        glowClass: 'cyber-glow-amber',
        icon: ShieldAlert,
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    if (score <= 85) {
      return {
        color: '#f97316', // Orange
        bgClass: 'bg-orange-950/60',
        borderClass: 'border-orange-500/50',
        textClass: 'text-orange-400',
        glowClass: 'cyber-glow-rose',
        icon: ShieldX,
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
      };
    }
    return {
      color: '#f43f5e', // Rose / Red
      bgClass: 'bg-rose-950/60',
      borderClass: 'border-rose-500/50',
      textClass: 'text-rose-400',
      glowClass: 'cyber-glow-rose',
      icon: Lock,
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  // Gauge calculations for SVG Arc (semi-circle 180 degrees)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Needle angle calculations (-90 deg at score 0, +90 deg at score 100)
  const needleAngle = -90 + (score / 100) * 180;

  return (
    <div className={`p-6 rounded-xl border ${theme.borderClass} ${theme.bgClass} ${theme.glowClass} transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Top Header */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${theme.textClass}`} />
          Composite Impersonation Risk
        </span>
        <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded border ${theme.badgeBg}`}>
          {verdict} RISK
        </span>
      </div>

      {/* SVG Arc Gauge Meter */}
      <div className="relative w-52 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background Track Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Dynamic Active Color Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={theme.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Center Pivot Circle */}
          <circle cx="100" cy="100" r="8" fill="#0f172a" stroke={theme.color} strokeWidth="3" />

          {/* Dynamic Needle Indicator */}
          <g transform={`rotate(${needleAngle}, 100, 100)`} className="transition-transform duration-700 ease-out">
            <line x1="100" y1="100" x2="100" y2="30" stroke={theme.color} strokeWidth="3.5" strokeLinecap="round" />
            <polygon points="96,100 104,100 100,22" fill={theme.color} />
          </g>
        </svg>

        {/* Center Score Readout Overlay */}
        <div className="absolute bottom-0 text-center translate-y-2">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${theme.textClass}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">
            / 100 Risk Points
          </span>
        </div>
      </div>

      {/* Recommended Action Footer */}
      <div className="mt-6 w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Automated Protocol Action:</span>
        <span className={`font-bold uppercase ${theme.textClass} px-2 py-1 rounded bg-slate-900 border border-slate-800`}>
          {action}
        </span>
      </div>
    </div>
  );
}
