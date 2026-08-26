import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IngestControl from './components/IngestControl';
import RiskGauge from './components/RiskGauge';
import MultiLayerBreakdown from './components/MultiLayerBreakdown';
import HistoryLogTable from './components/HistoryLogTable';
import AlertModal from './components/AlertModal';
import PrivacyCompliancePanel from './components/PrivacyCompliancePanel';
import { ShieldAlert, Activity, Terminal } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleAnalysisComplete = (res) => {
    setAnalysisResult(res);
    setRefreshTrigger((prev) => prev + 1);

    // Auto-trigger Alert Modal if verdict is MEDIUM, HIGH, or CRITICAL
    if (res && res.verdict && res.verdict !== 'LOW') {
      setIsAlertOpen(true);
    }
  };

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

        {/* Privacy & Compliance Banner */}
        <PrivacyCompliancePanel />

        {/* Main Grid: Control & Risk Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Ingest Control Panel */}
          <div className="lg:col-span-1">
            <IngestControl
              onAnalysisComplete={handleAnalysisComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Right Column: Live Risk Gauge & Layer Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResult ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge Widget */}
                  <div className="md:col-span-1">
                    <RiskGauge
                      compositeScore={analysisResult.composite_score}
                      verdict={analysisResult.verdict}
                      action={analysisResult.recommended_action}
                    />
                  </div>

                  {/* Multi-Layer Breakdown */}
                  <div className="md:col-span-2">
                    <MultiLayerBreakdown
                      layerAScore={analysisResult.layer_a_score}
                      layerBScore={analysisResult.layer_b_score}
                    />
                  </div>
                </div>

                {/* Raw API Response View Stream */}
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase">
                      <Terminal className="w-3.5 h-3.5" /> POST /api/analyze-audio-chunk Response Stream
                    </span>
                    <span className="text-[10px] text-slate-500">{analysisResult.filename}</span>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="glass-panel h-80 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <Activity className="w-12 h-12 text-cyan-400/40 animate-pulse" />
                <h4 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider">
                  Awaiting Audio Ingestion
                </h4>
                <p className="text-xs text-slate-500 font-mono max-w-md">
                  Select a test audio sample from the Ingest Control panel (e.g. default pair: speaker01_en_01.wav) and click "Analyze Voice Stream" to initiate live risk scoring.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: SQLite History Audit Log */}
        <HistoryLogTable refreshTrigger={refreshTrigger} />
      </main>

      {/* Alert Modal for Medium/High/Critical Verdicts */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        result={analysisResult}
      />

      <footer className="glass-panel border-t border-slate-900 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-mono text-slate-500">
          VoiceShield SIH 2026 — Cybersecurity Cell Problem Statement #26104
        </div>
      </footer>
    </div>
  );
}
