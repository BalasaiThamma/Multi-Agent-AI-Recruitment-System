import React, { useState, useEffect } from 'react';
import { Candidate, HRNotification } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  UserCheck2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Users, 
  Bell, 
  Send, 
  ShieldCheck,
  Award
} from 'lucide-react';

interface HRShortlistingTabProps {
  candidates: Candidate[];
  selectedCandidate: Candidate;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const HRShortlistingTab: React.FC<HRShortlistingTabProps> = ({
  candidates,
  selectedCandidate,
  onRefreshCandidate,
  onLogEvent,
}) => {
  const [reviewerName, setReviewerName] = useState('Sarah Jenkins (Lead Recruiter)');
  const [reviewerNotes, setReviewerNotes] = useState('Excellent technical depth in distributed systems and strong algorithmic coding performance.');
  const [notifications, setNotifications] = useState<HRNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittedDecision, setSubmittedDecision] = useState<string | null>(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error);
  }, []);

  const handleDecision = async (decision: string) => {
    setLoading(true);
    onLogEvent('HRAgent', `Submitting Human Decision: ${decision} for ${selectedCandidate.id}...`, 'Running');

    try {
      const res = await api.submitDecision({
        candidate_id: selectedCandidate.id,
        reviewer_name: reviewerName,
        decision: decision,
        reviewer_notes: reviewerNotes
      });

      setSubmittedDecision(decision);
      if (decision === 'Approved Shortlist') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }

      onLogEvent('HRAgent', `Shortlist decision recorded: ${decision} (${res.notification.candidate_masked_ref})`, 'Success');
      
      // Refresh notifications & candidate
      api.getNotifications().then(setNotifications);
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('HRAgent', `Decision submission error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const shortlistedList = candidates.filter(c => c.status === 'Shortlisted');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <UserCheck2 className="w-5 h-5 text-indigo-400" />
            <span>HR Shortlisting & Human-in-the-Loop Governance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI provides advisory scoring only. Final shortlisting, rejection, and re-evaluations require explicit human review.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop Active</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Reviewer Action Form, Right Notifications & Shortlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Review Action Form (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Review Target</span>
              <h3 className="text-base font-bold text-white">{selectedCandidate.name} ({selectedCandidate.id})</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Merit Score</span>
              <div className="text-lg font-black text-indigo-300">
                {selectedCandidate.overall_merit_score ? `${selectedCandidate.overall_merit_score}/100` : '—'}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Human Reviewer Name / Title</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hiring Decision Rationale & Notes</label>
              <textarea
                rows={3}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter justification for shortlisting or rejection..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Decision Buttons Grid */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Select Final Human Action:</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleDecision('Approved Shortlist')}
                disabled={loading}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Shortlist</span>
              </button>

              <button
                onClick={() => handleDecision('Rejected')}
                disabled={loading}
                className="p-3 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Candidate</span>
              </button>

              <button
                onClick={() => handleDecision('Request Re-Evaluation')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Request Re-Eval</span>
              </button>

              <button
                onClick={() => handleDecision('Request Human Interview')}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Panel Interview</span>
              </button>
            </div>
          </div>

          {submittedDecision && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Decision "{submittedDecision}" recorded and dispatched to HR notification queue.</span>
            </div>
          )}
        </div>

        {/* Right: Automated HR Notification Feed & Shortlist Pool (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Approved Shortlist Pool */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Approved Candidate Shortlist Pool ({shortlistedList.length})</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ranked by Merit</span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {shortlistedList.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center">No candidates shortlisted yet.</div>
              ) : (
                shortlistedList.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-850 border border-emerald-900/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-200">{c.name}</span>
                      <span className="text-slate-500 text-[10px] ml-2 font-mono">{c.id}</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-xs">{c.overall_merit_score}/100</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* HR Notification Dispatch Log */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span>Automated HR Notifications Feed</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{notifications.length} events</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {notifications.length === 0 ? (
                <div className="text-xs text-slate-500 py-4 text-center">No notifications dispatched yet.</div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-indigo-400 font-bold">{notif.id || notif.notification_id}</span>
                      <span className="text-slate-500">{notif.created_at || notif.timestamp || 'Just now'}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message || notif.notification_message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
