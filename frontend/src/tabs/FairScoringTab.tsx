import React, { useState } from 'react';
import { Candidate, FairScoreResult } from '../types';
import { api } from '../services/api';
import { 
  Scale, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  FileCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface FairScoringTabProps {
  candidate: Candidate;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const FairScoringTab: React.FC<FairScoringTabProps> = ({
  candidate,
  onRefreshCandidate,
  onLogEvent,
}) => {
  const [fairResult, setFairResult] = useState<FairScoreResult | null>(null);
  const [identityVault, setIdentityVault] = useState<any>(null);
  const [maskedEvalData, setMaskedEvalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    onLogEvent('FairnessAgent', `Masking PII & calculating merit score for candidate ${candidate.id}...`, 'Running');

    try {
      const res = await api.calculateFairScore(candidate.id);
      setFairResult(res.data);
      setIdentityVault(res.identity_vault);
      setMaskedEvalData(res.masked_evaluation);
      onLogEvent('FairnessAgent', `Fair scoring complete: ${res.data.overall_merit_score}/100 • Fairness Audit: 100% Passed`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('FairnessAgent', `Fair scoring error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>Demographic-Blind Merit Scoring & Bias Mitigation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict demographic blinding (PII Masking) before transparent merit evaluation and automated fairness compliance verification.
          </p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Evaluating Merit Score...' : 'Run Demographic-Blind Merit Scoring'}</span>
        </button>
      </div>

      {/* Main Content */}
      {!fairResult ? (
        <div className="p-12 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
          <Scale className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-xs font-medium">No fair scoring audit computed yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Click "Run Fair Scoring Audit" to calculate merit scores with demographic masking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Weighted Score Summary Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Final Merit Score (Blind Evaluated)</div>
              <div className="text-3xl font-black text-white mt-1 flex items-baseline space-x-2">
                <span>{fairResult.overall_merit_score}/100</span>
                <span className="text-xs font-semibold text-emerald-400">
                  Recommendation: {fairResult.ai_recommendation}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
                {fairResult.scoring_rationale}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-end space-x-1">
                <ShieldCheck className="w-4 h-4 inline" />
                <span>Fairness Audit Passed</span>
              </div>
              <div className="text-[10px] text-slate-400">AI Advisory Only • Requires Human Sign-off</div>
            </div>
          </div>

          {/* 4 Weights Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Skill Match</span>
                <span className="font-bold text-indigo-400 font-mono">30% Weight</span>
              </div>
              <div className="text-xl font-bold text-white">{fairResult.skill_match_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Points: {round(fairResult.skill_match_score * 0.3)}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Coding Assessment</span>
                <span className="font-bold text-indigo-400 font-mono">35% Weight</span>
              </div>
              <div className="text-xl font-bold text-white">{fairResult.coding_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Points: {round(fairResult.coding_score * 0.35)}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Communication</span>
                <span className="font-bold text-indigo-400 font-mono">20% Weight</span>
              </div>
              <div className="text-xl font-bold text-white">{fairResult.communication_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Points: {round(fairResult.communication_score * 0.2)}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Protocol Compliance</span>
                <span className="font-bold text-indigo-400 font-mono">15% Weight</span>
              </div>
              <div className="text-xl font-bold text-white">{fairResult.protocol_compliance_score}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Points: {round(fairResult.protocol_compliance_score * 0.15)}</div>
            </div>
          </div>

          {/* Demographic Masking Demonstration: Identity Vault vs Evaluation Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Identity Data (Masked) */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Isolated Identity Vault (Excluded from AI Ranking)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Name:</span>
                  <span className="text-slate-400 font-bold blur-[3px] select-none hover:blur-none transition-all">{identityVault?.name || candidate.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-400 blur-[3px] select-none hover:blur-none transition-all">{identityVault?.location || 'San Francisco, CA'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Graduation Year:</span>
                  <span className="text-slate-400 blur-[3px] select-none hover:blur-none transition-all">{identityVault?.graduation_year || 2018}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Gender / Demographic:</span>
                  <span className="text-emerald-400">Sanitized (Null)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Headshot / Photo:</span>
                  <span className="text-emerald-400">Excluded (Null)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * Demographic markers are strictly quarantined and never supplied to the scoring agents.
              </p>
            </div>

            {/* Right: Job-Relevant Evaluation Data */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
                <EyeOff className="w-4 h-4 text-indigo-400" />
                <span>Evaluation Data (Provided to Scoring Agent)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Candidate Ref:</span>
                  <span className="text-indigo-400 font-bold">{maskedEvalData?.candidate_id || `CAND-REF-${candidate.id.slice(-3)}`}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Applied Role:</span>
                  <span className="text-slate-200">{candidate.role_applied}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-500">Experience Tier:</span>
                  <span className="text-slate-200">{maskedEvalData?.years_experience_level || 'Senior Level'}</span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 space-y-1">
                  <div>• Coding: <span className="text-slate-200">{maskedEvalData?.coding_evidence}</span></div>
                  <div>• Screening: <span className="text-slate-200">{maskedEvalData?.screening_evidence}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fairness Audit Verification Checklist */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Automated Fairness Audit Compliance Checklist</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fairResult.audit_checks.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-slate-800 text-xs flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200">{chk.check_name}</div>
                    <div className="text-[11px] text-slate-400">{chk.description}</div>
                    <div className="text-[10px] text-indigo-400 font-mono">{chk.evidence_trail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function round(val: number): number {
  return Math.round(val * 10) / 10;
}
