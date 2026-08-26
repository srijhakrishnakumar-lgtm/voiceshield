import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, PhoneCall, Lock, UserCheck, X, CheckCircle2 } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  const { composite_score = 0, verdict = 'MEDIUM', recommended_action = 'STEP_UP_MFA', filename = '' } = result;

  const [actionFeedback, setActionFeedback] = useState(null);

  const handleAction = (actionName, details) => {
    setActionFeedback({
      name: actionName,
      details: details,
      time: new Date().toLocaleTimeString()
    });
  };

  const getVerdictTheme = () => {
    if (verdict === 'CRITICAL' || composite_score > 85) {
      return {
        bg: 'bg-rose-950/95 border-rose-500/80',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
        icon: Lock,
        glow: 'cyber-glow-rose'
      };
    }
    if (verdict === 'HIGH' || composite_score > 65) {
      return {
        bg: 'bg-orange-950/95 border-orange-500/80',
        text: 'text-orange-400',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
        icon: AlertOctagon,
        glow: 'cyber-glow-rose'
      };
    }
    return {
      bg: 'bg-amber-950/95 border-amber-500/80',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: ShieldAlert,
      glow: 'cyber-glow-amber'
    };
  };

  const theme = getVerdictTheme();
  const IconComponent = theme.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative max-w-lg w-full rounded-2xl border ${theme.bg} ${theme.glow} p-6 space-y-6 shadow-2xl transition-all`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className={`p-3 rounded-xl bg-slate-900 border ${theme.bg.split(' ')[1]} flex items-center justify-center`}>
            <IconComponent className={`w-7 h-7 ${theme.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${theme.badge}`}>
                {verdict} IMPERSONATION RISK DETECTED
              </span>
            </div>
            <h3 className="text-lg font-bold font-mono text-slate-100 mt-1">
              Synthetic Voice Fraud Protocol Alert
            </h3>
          </div>
        </div>

        {/* Details Summary */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-500">Target File Stream:</span>
            <span className="font-bold text-slate-200">{filename}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-500">Composite Risk Score:</span>
            <span className={`text-base font-extrabold ${theme.text}`}>
              {composite_score.toFixed(1)} / 100
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-500">Automated Protocol Action:</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase ${theme.text} bg-slate-950 border border-slate-800`}>
              {recommended_action}
            </span>
          </div>
        </div>

        {/* Feedback Toast Banner */}
        {actionFeedback && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs font-mono text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase">{actionFeedback.name} EXECUTED</span>
              <span className="text-[11px] text-slate-300">{actionFeedback.details}</span>
            </div>
          </div>
        )}

        {/* Protocol Mitigation Response Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Simulated Fraud Mitigation Response Actions:
          </span>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleAction('Escalate to Supervisor', 'Case assigned to Tier-2 SOC Analyst for live audio review.')}
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Escalate to Supervisor</span>
            </button>

            <button
              onClick={() => handleAction('Trigger Callback Verification', 'Out-of-band mobile OTP voice callback initiated to registered phone number.')}
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50 flex items-center justify-center gap-2 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Trigger Callback Verification</span>
            </button>

            <button
              onClick={() => handleAction('Block Transaction', 'Authentication token revoked and voice channel session terminated immediately.')}
              className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
            >
              <Lock className="w-4 h-4" />
              <span>Block Transaction</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Dismiss */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
}
