import React, { useState } from 'react';
import { ShieldCheck, Lock, EyeOff, FileText, ChevronRight, X } from 'lucide-react';

export default function PrivacyCompliancePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Privacy Banner Ribbon */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-slate-200 uppercase">
                Privacy & Data Retention Compliance Protocol
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold">
                DPDP ACT COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              No raw audio stored — only feature vectors and composite risk scores are retained in database.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>View Policy</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Slide-out Privacy & Compliance Modal/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-xl w-full rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 space-y-6 shadow-2xl cyber-glow-cyan">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-100 uppercase">
                    Data Privacy & Security Guarantee
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    VoiceShield Enterprise Data Protection Architecture
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compliance Guarantee Highlights */}
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-xs">
                  <EyeOff className="w-4 h-4" />
                  Zero Raw Audio Persistence Principle
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  VoiceShield executes memory-only spectral feature extraction on incoming audio buffers. 
                  <strong className="text-slate-100"> No raw audio files, speech recordings, or voice waveforms are saved to disk, logged, or retained in SQLite database.</strong>
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                  Compliance Architecture Pillars:
                </span>
                <ul className="space-y-2">
                  <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 block">Ephemeral In-Memory Processing</strong>
                      <span className="text-slate-400 text-[11px]">Audio chunks exist in RAM only for the duration of DSP feature extraction (&lt;50ms) and are immediately garbage-collected.</span>
                    </div>
                  </li>

                  <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 block">Audit-Only Anonymized Logging</strong>
                      <span className="text-slate-400 text-[11px]">Database logs only store numerical score floats (<code className="text-cyan-300">layer_a_score</code>, <code className="text-cyan-300">layer_b_score</code>, <code className="text-cyan-300">composite_score</code>) and action strings.</span>
                    </div>
                  </li>

                  <li className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 block">DPDP Act 2023 & RBI Cyber Security Guidelines</strong>
                      <span className="text-slate-400 text-[11px]">Complies with Indian Digital Personal Data Protection Act requirements for biometric non-retention in banking auth streams.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-5 rounded-lg text-xs font-mono text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all font-semibold"
              >
                Close Compliance Overview
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
