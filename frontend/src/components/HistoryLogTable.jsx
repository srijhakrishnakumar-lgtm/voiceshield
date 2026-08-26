import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Clock } from 'lucide-react';

export default function HistoryLogTable({ refreshTrigger }) {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          SQLite Audit Log History (`chunk_logs`)
        </h3>
        <button
          onClick={fetchHistory}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {historyLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-900/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Layer A</th>
                <th className="py-2.5 px-3">Layer B</th>
                <th className="py-2.5 px-3">Composite</th>
                <th className="py-2.5 px-3">Verdict</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {historyLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400 text-[10px] flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{log.filename || 'chunk.wav'}</td>
                  <td className="py-2.5 px-3">{log.layer_a_score.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{log.layer_b_score.toFixed(1)}</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{log.composite_score.toFixed(1)}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.verdict === 'LOW'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : log.verdict === 'MEDIUM'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {log.verdict}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{log.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs font-mono text-slate-500">
          No audit logs recorded yet. Run analysis above to populate SQLite logs.
        </div>
      )}
    </div>
  );
}
