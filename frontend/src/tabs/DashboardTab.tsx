import React from 'react';
import { Candidate } from '../types';
import { 
  Users, 
  FileText, 
  Code2, 
  Mic2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Play
} from 'lucide-react';

interface DashboardTabProps {
  candidates: Candidate[];
  onSelectCandidate: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
  onRunFullPipeline: (id: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  candidates,
  onSelectCandidate,
  onNavigateTab,
  onRunFullPipeline,
}) => {
  const total = candidates.length;
  const parsed = candidates.filter(c => c.resume_status === 'Completed').length;
  const codingDone = candidates.filter(c => c.coding_status === 'Completed').length;
  const screeningDone = candidates.filter(c => c.screening_status === 'Completed').length;
  const awaitingApproval = candidates.filter(c => c.status === 'Awaiting Approval').length;
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length;

  const statCards = [
    { label: 'Total Candidates', value: total, icon: Users, color: 'from-blue-500/20 to-indigo-500/10 text-blue-400' },
    { label: 'Resumes Parsed', value: parsed, icon: FileText, color: 'from-purple-500/20 to-pink-500/10 text-purple-400' },
    { label: 'Coding Completed', value: codingDone, icon: Code2, color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400' },
    { label: 'Audio Screened', value: screeningDone, icon: Mic2, color: 'from-amber-500/20 to-orange-500/10 text-amber-400' },
    { label: 'Awaiting Approval', value: awaitingApproval, icon: Clock, color: 'from-rose-500/20 to-red-500/10 text-rose-400' },
    { label: 'Shortlisted by HR', value: shortlisted, icon: CheckCircle2, color: 'from-emerald-500/20 to-green-500/10 text-emerald-400' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Recruitment Assessment Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous multi-agent evaluation pipeline with strict PII masking, sandbox code execution, STAR interview deconstruction, and Human-in-the-Loop shortlisting.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Fairness Check</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-end space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 inline" />
              <span>100% Bias Guardrails Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="p-4 rounded-xl glass-panel border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400">{st.label}</span>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white">{st.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recruitment Pipeline Funnel Visualization */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span>Autonomous Recruitment Pipeline Funnel</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { step: '1. Resume Parser', status: 'Active', count: parsed, tab: 'resume' },
            { step: '2. Skill Match RAG', status: 'Active', count: parsed, tab: 'matching' },
            { step: '3. Coding Sandbox', status: 'Active', count: codingDone, tab: 'coding' },
            { step: '4. Audio Screening', status: 'Active', count: screeningDone, tab: 'screening' },
            { step: '5. Fair Scoring', status: 'Masked', count: codingDone, tab: 'scoring' },
            { step: '6. Human Review', status: 'Pending', count: awaitingApproval, tab: 'hr' },
            { step: '7. Shortlisted', status: 'Complete', count: shortlisted, tab: 'hr' },
          ].map((pipe, idx) => (
            <button
              key={idx}
              onClick={() => onNavigateTab(pipe.tab)}
              className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
            >
              <div className="text-[10px] text-slate-400 font-semibold mb-1">{pipe.step}</div>
              <div className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{pipe.count}</div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{pipe.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Candidate Roster Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Candidate Evaluation Roster</h3>
            <p className="text-xs text-slate-400">Click any candidate to inspect their detailed agent assessments</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Candidate Ref</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4 text-center">Skill Match</th>
                <th className="py-3 px-4 text-center">Coding Score</th>
                <th className="py-3 px-4 text-center">Screening</th>
                <th className="py-3 px-4 text-center">Merit Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{c.role_applied}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {c.skill_match_score ? `${c.skill_match_score}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {c.coding_score ? `${c.coding_score}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {c.communication_score ? `${c.communication_score}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {c.overall_merit_score ? (
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        c.overall_merit_score >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {c.overall_merit_score}/100
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
                      c.status === 'Shortlisted'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : c.status === 'Awaiting Approval'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        onSelectCandidate(c.id);
                        onNavigateTab('report');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => {
                        onSelectCandidate(c.id);
                        onRunFullPipeline(c.id);
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold inline-flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Assess</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
