import React, { useState, useEffect } from 'react';
import { Candidate, JobDescription, SkillGapAnalysisResult } from '../types';
import { api } from '../services/api';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck, 
  Lightbulb, 
  Database,
  Search
} from 'lucide-react';

interface SkillMatchingTabProps {
  candidate: Candidate;
  jobs: JobDescription[];
  activeProvider: string;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const SkillMatchingTab: React.FC<SkillMatchingTabProps> = ({
  candidate,
  jobs,
  activeProvider,
  onRefreshCandidate,
  onLogEvent,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || 'JD-BACKEND-001');
  const [analysisResult, setAnalysisResult] = useState<SkillGapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const handleRunAnalysis = async () => {
    if (!candidate.parsed_data) {
      alert('Please parse candidate resume in Tab 2 first!');
      return;
    }

    setLoading(true);
    onLogEvent('SkillMatcher', `Running RAG semantic search & skill match for ${candidate.name}...`, 'Running');

    try {
      const res = await api.analyzeSkills({
        candidate_id: candidate.id,
        job_title: selectedJob.title,
        required_skills: selectedJob.required_skills,
        preferred_skills: selectedJob.preferred_skills,
        job_description: selectedJob.description,
        provider: activeProvider
      });

      setAnalysisResult(res.data);
      onLogEvent('SkillMatcher', `Matched ${res.data.overall_match_score}% fit (${res.data.strong_matches.length} strong, ${res.data.skill_gaps.length} gaps)`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('SkillMatcher', `Analysis error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <span>Skill Match & Gap Analysis Agent (RAG)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Vector similarity retrieval (pgvector / Cosine) compares resume evidence against JD requirements with cited proof.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Evaluating Match...' : 'Run Skill Match Agent'}</span>
          </button>
        </div>
      </div>

      {/* Target Job Overview Card */}
      {selectedJob && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">{selectedJob.title}</span>
            <span className="text-slate-400">{selectedJob.location} • {selectedJob.experience_level}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{selectedJob.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Required:</span>
            {selectedJob.required_skills?.map((s, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {!analysisResult ? (
        <div className="p-12 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center text-center text-slate-500">
          <Target className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-xs font-medium">No skill match analysis generated yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Click "Run Skill Match Agent" to perform RAG vector semantic matching.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Skill Match Fit</span>
              <div className="text-3xl font-black text-white flex items-baseline space-x-2">
                <span>{analysisResult.overall_match_score}%</span>
                <span className="text-xs font-medium text-emerald-400">
                  {analysisResult.overall_match_score >= 80 ? 'High Competency Match' : 'Moderate Match'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-center">
              <div>
                <div className="text-lg font-bold text-emerald-400">{analysisResult.strong_matches.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Strong Matches</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-400">{analysisResult.partial_matches.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Partial Matches</div>
              </div>
              <div>
                <div className="text-lg font-bold text-rose-400">{analysisResult.skill_gaps.length}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Skill Gaps</div>
              </div>
            </div>
          </div>

          {/* Categorized Skills Breakdown with Evidence Citations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strong Matches */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/30 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strong Matches ({analysisResult.strong_matches.length})</span>
              </div>
              <div className="space-y-2.5">
                {analysisResult.strong_matches.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-emerald-950 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{item.skill_name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{Math.round(item.confidence * 100)}% conf</span>
                    </div>
                    {item.candidate_evidence && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        "{item.candidate_evidence}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Partial Matches */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-amber-900/30 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Partial Matches ({analysisResult.partial_matches.length})</span>
              </div>
              <div className="space-y-2.5">
                {analysisResult.partial_matches.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-amber-950 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{item.skill_name}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{Math.round(item.confidence * 100)}% conf</span>
                    </div>
                    {item.candidate_evidence && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        "{item.candidate_evidence}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-rose-900/30 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Skill Gaps ({analysisResult.skill_gaps.length})</span>
              </div>
              <div className="space-y-2.5">
                {analysisResult.skill_gaps.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">No missing required skills detected!</div>
                ) : (
                  analysisResult.skill_gaps.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-850 border border-rose-950 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{item.skill_name}</span>
                        <span className="text-[10px] text-rose-400 font-medium">Missing</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Not demonstrated in resume work history or projects.</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-1.5">
              <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>AI Hiring Recommendations</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                {analysisResult.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
