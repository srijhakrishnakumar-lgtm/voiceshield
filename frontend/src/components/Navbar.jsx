import React from 'react';
import { ShieldCheck, Activity, Radio, Cpu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 cyber-glow-cyan">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase font-mono">
                Voice<span className="text-cyan-400">Shield</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v1.0.0 OPS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              AI Voice Cloning & Synthetic Audio Fraud Prevention System
            </p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>SIH 2026 #26104</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-medium cyber-glow-emerald">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Activity className="w-3.5 h-3.5" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>

      </div>
    </header>
  );
}
