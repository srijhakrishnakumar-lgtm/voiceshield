import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IngestControl from './components/IngestControl';
import { ShieldAlert, Terminal, Code2 } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 cyber-grid flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Dashboard Header Banner */}
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
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Ingest Control */}
          <div className="lg:col-span-1">
            <IngestControl
              onAnalysisComplete={(res) => setAnalysisResult(res)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Right Panel: Analysis Raw JSON Output */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Backend API Raw Response Stream
              </h3>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> POST /api/analyze-audio-chunk
              </span>
            </div>

            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto text-cyan-300">
                  <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
                </div>
                
                {/* Highlights Summary */}
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[10px]">LAYER A ACOUSTIC</span>
                    <span className="text-sm font-bold text-slate-200">{analysisResult.layer_a_score}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[10px]">LAYER B PROSODY</span>
                    <span className="text-sm font-bold text-slate-200">{analysisResult.layer_b_score}</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
                    <span className="text-slate-500 block text-[10px]">COMPOSITE RISK</span>
                    <span className={`text-sm font-bold ${
                      analysisResult.composite_score < 35 ? 'text-emerald-400' :
                      analysisResult.composite_score <= 65 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {analysisResult.composite_score} ({analysisResult.verdict})
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800/80 rounded-lg text-slate-500 font-mono text-xs">
                <Terminal className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                <p>Select a sample clip or upload a WAV file and click "Analyze Voice Stream"</p>
                <p className="text-[10px] text-slate-600 mt-1">Default demo pair: speaker01_en_01.wav (Genuine vs Cloned)</p>
              </div>
            )}
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
