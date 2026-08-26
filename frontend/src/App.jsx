import React from 'react';
import Navbar from './components/Navbar';
import { ShieldAlert, Server, Cpu, Database } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Dashboard Header banner */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              REAL-TIME VOICE FRAUD OPERATIONAL DASHBOARD
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Multi-Layer Acoustic & Prosodic Synthesis Detection Engine for Live Authentication Streams
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> FastAPI Active
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> SQLite Logged
            </span>
          </div>
        </div>

        {/* Dashboard Placeholder Grid (Will be populated in next steps) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider mb-4">
              Ingest Control
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Audio stream selector & file uploader component...
            </p>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
              Live Impersonation Risk Score
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Composite risk gauge, multi-layer feature breakdown & alert modal...
            </p>
          </div>
        </div>
      </main>

      <footer className="glass-panel border-t border-slate-900 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500">
          VoiceShield SIH 2026 — Cybersecurity Cell Problem Statement #26104
        </div>
      </footer>
    </div>
  );
}
