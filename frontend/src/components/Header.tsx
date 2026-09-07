import React from 'react';
import { Candidate } from '../types';
import { 
  Play, 
  RefreshCw, 
  User, 
  CheckCircle2, 
  Clock,
  Radio,
  Briefcase,
  Layers
} from 'lucide-react';

interface HeaderProps {
  candidates: Candidate[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onRunFullPipeline: () => void;
  onResetDemoData: () => void;
  isPipelineRunning: boolean;
  currentRole: 'recruiter' | 'candidate';
  onChangeRole: (role: 'recruiter' | 'candidate') => void;
  toggleActivityPanel: () => void;
  activityCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onRunFullPipeline,
  onResetDemoData,
  isPipelineRunning,
  currentRole,
  onChangeRole,
  toggleActivityPanel,
  activityCount
}) => {
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-10 shrink-0">
      {/* Left: Active Candidate Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Candidate Profile</div>
            <select
              value={selectedCandidateId}
              onChange={(e) => onSelectCandidate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none cursor-pointer hover:text-indigo-400 transition-colors"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.name} ({c.id}) - {c.role_applied}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate status badge */}
        {selectedCandidate && (
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center space-x-1.5 border ${
            selectedCandidate.status === 'Shortlisted'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              : selectedCandidate.status === 'Awaiting Approval'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              selectedCandidate.status === 'Shortlisted' ? 'bg-emerald-400' : selectedCandidate.status === 'Awaiting Approval' ? 'bg-amber-400' : 'bg-slate-400'
            }`} />
            <span>{selectedCandidate.status}</span>
          </span>
        )}
      </div>

      {/* Right Controls: Role Switcher, Pipeline Trigger, Activity Stream */}
      <div className="flex items-center space-x-3">
        {/* Role Switcher: Recruiter vs Candidate Portal */}
        <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => onChangeRole('recruiter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              currentRole === 'recruiter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter Panel</span>
          </button>
          <button
            onClick={() => onChangeRole('candidate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              currentRole === 'candidate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </button>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetDemoData}
          title="Reset Sample Candidates"
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Activity Log Stream Toggle */}
        <button
          onClick={toggleActivityPanel}
          className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-all"
        >
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Activity Log</span>
          {activityCount > 0 && (
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {activityCount}
            </span>
          )}
        </button>

        {/* Run Full Assessment */}
        <button
          onClick={onRunFullPipeline}
          disabled={isPipelineRunning}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md ${
            isPipelineRunning
              ? 'bg-indigo-700 text-indigo-200 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isPipelineRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Assessment in Progress...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Assessment Pipeline</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
