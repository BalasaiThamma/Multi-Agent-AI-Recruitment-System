import React, { useState, useEffect } from 'react';
import { Candidate, CodingEvaluationResult } from '../types';
import { api } from '../services/api';
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Layers, 
  Sparkles, 
  Terminal,
  Activity,
  Check,
  UserCheck,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';

interface CodingAssessmentTabProps {
  candidate: Candidate;
  onRefreshCandidate: () => void;
  onLogEvent: (stage: string, message: string, status: 'Running' | 'Success' | 'Failed') => void;
}

export const CodingAssessmentTab: React.FC<CodingAssessmentTabProps> = ({
  candidate,
  onRefreshCandidate,
  onLogEvent,
}) => {
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('PROB-TWO-SUM');
  const [language, setLanguage] = useState<string>('python');
  const [candidateCode, setCandidateCode] = useState<string>('');
  const [hasCandidateSubmission, setHasCandidateSubmission] = useState(false);
  const [sandboxProvider, setSandboxProvider] = useState<string>('docker');
  const [evaluationResult, setEvaluationResult] = useState<CodingEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSubmission, setFetchingSubmission] = useState(false);

  // Load Problem List
  useEffect(() => {
    api.getCodingProblems().then(probs => {
      setProblems(probs);
    }).catch(console.error);
  }, []);

  // Load Candidate's Submission when candidate changes
  useEffect(() => {
    const loadCandidateSubmission = async () => {
      setFetchingSubmission(true);
      try {
        const sub = await api.getCandidateCodingSubmission(candidate.id);
        setSelectedProblemId(sub.problem_id || 'PROB-TWO-SUM');
        setLanguage(sub.language || 'python');
        setCandidateCode(sub.submitted_code || '');
        setHasCandidateSubmission(sub.has_submitted);
        if (sub.evaluation) {
          setEvaluationResult(sub.evaluation);
        } else {
          setEvaluationResult(null);
        }
      } catch (err) {
        console.error('Failed to load candidate submission:', err);
      } finally {
        setFetchingSubmission(false);
      }
    };

    loadCandidateSubmission();
  }, [candidate.id]);

  const activeProblem = problems.find(p => p.id === selectedProblemId) || problems[0];

  const handleSelectProblem = (probId: string) => {
    setSelectedProblemId(probId);
    const p = problems.find(prob => prob.id === probId);
    if (p && !hasCandidateSubmission) {
      setCandidateCode(p.starter_code?.[language] || p.starter_code?.python || '');
    }
  };

  const handleRunEvaluation = async () => {
    if (!candidateCode.trim()) return;
    setLoading(true);
    onLogEvent('TechAgent', `Evaluating candidate solution for ${candidate.name} in isolated ${sandboxProvider.toUpperCase()} sandbox...`, 'Running');

    try {
      const res = await api.executeCode({
        candidate_id: candidate.id,
        problem_id: selectedProblemId,
        language: language,
        code: candidateCode,
        provider: sandboxProvider
      });

      setEvaluationResult(res.data);
      setHasCandidateSubmission(true);
      onLogEvent('TechAgent', `Execution complete: ${res.data.passed_count}/${res.data.total_count} test cases passed (${res.data.total_execution_time_ms}ms, Cyclomatic: ${res.data.cyclomatic_complexity})`, 'Success');
      onRefreshCandidate();
    } catch (err: any) {
      onLogEvent('TechAgent', `Execution error: ${err.message}`, 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span>Candidate Coding Assessment & Verification</span>
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Recruiter Evaluation Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review the code typed and submitted by <strong className="text-slate-200">{candidate.name}</strong> ({candidate.id}), run isolated sandboxed unit tests, and audit algorithmic time/space metrics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Docker Isolate Sandbox</span>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={loading || fetchingSubmission || !candidateCode.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Evaluating in Sandbox...' : 'Run & Evaluate Candidate Code'}</span>
          </button>
        </div>
      </div>

      {/* Candidate Status Banner */}
      <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <span className="text-slate-400">Candidate Submission: </span>
            <strong className="text-white">{candidate.name}</strong>
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-indigo-400 font-medium">Role: {candidate.role_applied}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Assessment Status:</span>
          {candidate.coding_score > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified ({candidate.coding_score}%)</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Ready for Sandbox Run
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Candidate's Code (Read/Inspect), Right Test Results & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem & Candidate Submitted Code (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Problem Statement Card */}
          {activeProblem && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedProblemId}
                    onChange={(e) => handleSelectProblem(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                  >
                    {problems.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {activeProblem.difficulty}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{activeProblem.id}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.description}</p>
            </div>
          )}

          {/* Candidate Code Inspection Window */}
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-200 text-[11px] font-semibold">
                  candidate_submission.{language === 'python' ? 'py' : 'js'}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                  Candidate Typed Output
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="text-slate-400 font-mono">Language: <strong className="text-slate-200">{language === 'python' ? 'Python 3.11' : 'JavaScript (ES6)'}</strong></span>
              </div>
            </div>

            {/* Code Display Area (Editable if recruiter wants to test modifications, highlighted styling) */}
            <div className="relative">
              <textarea
                value={candidateCode}
                onChange={(e) => setCandidateCode(e.target.value)}
                spellCheck={false}
                placeholder="// Candidate solution will appear here..."
                className="w-full h-84 bg-slate-950 p-4 text-xs font-mono text-emerald-400 focus:outline-none leading-relaxed resize-none selection:bg-indigo-600/40 border-0"
              />
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-500 font-mono pointer-events-none bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                Candidate Solution View
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Metrics & Test Cases Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!evaluationResult ? (
            <div className="p-8 rounded-2xl glass-panel border border-slate-800 h-full flex flex-col items-center justify-center text-center text-slate-500 min-h-[420px]">
              <Cpu className="w-12 h-12 mb-3 opacity-30 text-indigo-400" />
              <p className="text-xs font-semibold text-slate-300">Ready to Evaluate Candidate Solution</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                Click <strong className="text-emerald-400">"Run & Evaluate Candidate Code"</strong> above to benchmark test cases, execution time, and algorithmic cyclomatic complexity.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Score & Complexity Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Score</span>
                    <p className="text-[11px] text-slate-500">Automated Sandbox Benchmark</p>
                  </div>
                  <span className={`text-2xl font-black ${evaluationResult.all_passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {evaluationResult.overall_coding_score}/100
                  </span>
                </div>

                {/* Complexity Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Time</div>
                    <div className="text-xs font-mono font-bold text-indigo-300">{evaluationResult.time_complexity_estimated}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Space</div>
                    <div className="text-xs font-mono font-bold text-indigo-300">{evaluationResult.space_complexity_estimated}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-850 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Cyclomatic</div>
                    <div className="text-xs font-mono font-bold text-emerald-300">{evaluationResult.cyclomatic_complexity} ({evaluationResult.cyclomatic_complexity_rating || 'Clean'})</div>
                  </div>
                </div>

                {/* Edge cases handled */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Edge Cases Checked:</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {Object.entries(evaluationResult.edge_cases_handled || {}).map(([name, pass], idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-slate-300">
                        {pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span className="truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unit Test Cases Grid */}
              <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>Unit Test Results ({evaluationResult.passed_count}/{evaluationResult.total_count} Passed)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{evaluationResult.total_execution_time_ms}ms total</span>
                </div>

                {evaluationResult.test_case_results?.map((tc) => (
                  <div
                    key={tc.test_id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      tc.passed
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center space-x-1.5">
                        {tc.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{tc.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{tc.execution_time_ms}ms</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 space-y-0.5 pt-0.5">
                      <div>Input: <span className="text-slate-200">{tc.input_data}</span></div>
                      <div>Expected: <span className="text-emerald-300">{tc.expected_output}</span> • Actual: <span className={tc.passed ? 'text-emerald-300' : 'text-rose-300'}>{tc.actual_output || 'None'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
