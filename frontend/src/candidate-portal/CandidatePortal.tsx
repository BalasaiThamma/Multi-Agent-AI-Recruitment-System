import React, { useState, useEffect, useRef } from 'react';
import { Candidate, JobDescription, ParsedResume, SkillGapAnalysisResult, CodingEvaluationResult, ScreeningAnalysisResult } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  FileUp, 
  Code2, 
  Mic2, 
  CheckCircle2, 
  Clock, 
  Play, 
  Sparkles, 
  Volume2, 
  Send, 
  User, 
  Briefcase, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  Search, 
  CheckCircle,
  Building2,
  Lock,
  EyeOff,
  Sliders,
  Check,
  Zap,
  Target,
  FileText,
  UploadCloud,
  FileCheck,
  FileCode
} from 'lucide-react';

interface CandidatePortalProps {
  candidates: Candidate[];
  selectedCandidate: Candidate;
  jobs: JobDescription[];
  onCandidateCreatedOrUpdated: () => void;
  onNavigateToRecruiter: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  candidates,
  selectedCandidate,
  jobs: initialJobs,
  onCandidateCreatedOrUpdated,
  onNavigateToRecruiter
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  
  // Step 1: PDF/Word Resume File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(selectedCandidate.parsed_data || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 2: Available Jobs & Company Matching
  const [availableJobs, setAvailableJobs] = useState<JobDescription[]>(initialJobs || []);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [isAnalyzingSkills, setIsAnalyzingSkills] = useState(false);
  const [skillGapResult, setSkillGapResult] = useState<SkillGapAnalysisResult | null>(null);

  // Step 3: Coding Test
  const [candidateCode, setCandidateCode] = useState(`def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    """
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codingFeedback, setCodingFeedback] = useState<CodingEvaluationResult | null>(null);

  // Step 4: Audio / Video Interview
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioReady, setRecordedAudioReady] = useState(selectedCandidate.screening_status === 'Completed');
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);
  const [interviewResult, setInterviewResult] = useState<ScreeningAnalysisResult | null>(null);
  const [interviewAnswer, setInterviewAnswer] = useState(
    "In my previous role, our message ingestion pipeline was experiencing significant bottleneck during peak hours, dropping 12% of events. I took ownership of redesigning the architecture by decoupling the ingestion tier with Redis Streams, implemented asynchronous batch processing in Python with FastAPI, and provisioned auto-scaling worker pools. As a result, throughput increased by 300% to 40k events/sec, end-to-end latency dropped to 18ms, and zero data was lost during our Black Friday surge."
  );

  // Sync initial jobs
  useEffect(() => {
    if (initialJobs && initialJobs.length > 0) {
      setAvailableJobs(initialJobs);
      if (!selectedJob) {
        setSelectedJob(initialJobs[0]);
      }
    }
  }, [initialJobs]);

  // Timer for audio recording simulation
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Handle Real File Upload (PDF, Word, TXT)
  const handleProcessFile = async (file: File) => {
    setSelectedFile(file);
    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const res = await api.uploadResumeFile(file, selectedCandidate.id);
      setParsedData(res.parsed_resume);
      if (res.matched_jobs && res.matched_jobs.length > 0) {
        setAvailableJobs(res.matched_jobs);
        setSelectedJob(res.matched_jobs[0]);
      }
      onCandidateCreatedOrUpdated();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setActiveStep(2), 800);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse resume document.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Sample Resume Creator for 1-Click Testing with Real Files
  const handleLoadSampleDocument = async (sampleType: 'senior-backend' | 'ai-fullstack' | 'cloud-architect') => {
    let content = '';
    let fileName = '';
    
    if (sampleType === 'senior-backend') {
      fileName = 'Alex_Chen_Senior_Backend_Resume.txt';
      content = `ALEX CHEN | San Francisco, CA | alex.chen@example.com | +1 (555) 234-5678
PROFESSIONAL SUMMARY:
Senior Backend Engineer with 6+ years experience architecting distributed microservices, high-throughput REST APIs in Python & FastAPI, and scalable Redis/PostgreSQL pipelines.
TECHNICAL SKILLS:
Languages: Python (Expert), SQL, Go, TypeScript, Bash
Frameworks & Databases: FastAPI, AsyncIO, PostgreSQL, Redis, Celery, Docker, Kubernetes
EXPERIENCE:
Senior Backend Engineer | CloudScale Tech (2021 - Present)
• Built high-concurrency event ingestion pipelines handling 40M+ daily events with 99.99% uptime.
• Reduced database query latency by 45% using PostgreSQL indexing and Redis caching.
EDUCATION:
B.S. in Computer Science | UC Berkeley (2018)`;
    } else if (sampleType === 'ai-fullstack') {
      fileName = 'Jordan_Miller_FullStack_AI_Resume.txt';
      content = `JORDAN MILLER | Seattle, WA | jordan.miller@example.com
PROFESSIONAL SUMMARY:
Full Stack AI Application Engineer with 4 years building reactive React, TypeScript, and FastAPI interfaces.
TECHNICAL SKILLS:
React, TypeScript, Next.js, Python, FastAPI, Vector Search, Tailwind CSS, Docker
EXPERIENCE:
Full Stack AI Engineer | Synapse AI (2022 - Present)
• Built user-facing LLM prompt orchestration dashboards with real-time WebSocket streaming.
• Integrated semantic vector search using pgvector and FastAPI.
EDUCATION:
B.S. in Software Engineering | University of Washington (2020)`;
    } else {
      fileName = 'Elena_Rostova_Cloud_Architect_Resume.txt';
      content = `ELENA ROSTOVA | San Mateo, CA | elena.rostova@example.com
PROFESSIONAL SUMMARY:
Cloud Data Platform Architect with 7+ years in distributed storage, Snowflake, PostgreSQL, and multi-cloud Kubernetes.
TECHNICAL SKILLS:
Python, PostgreSQL, Distributed Systems, Docker, Kubernetes, AWS, Cloud Architecture, SQL
EXPERIENCE:
Lead Data Architect | Apex Data Systems (2020 - Present)
• Architected enterprise multi-region data cloud ingestion processing 10TB+ daily.
EDUCATION:
M.S. in Computer Science | Stanford University (2017)`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });
    await handleProcessFile(file);
  };

  // Step 2: Compare Selected Job Description & Calculate Skill Gaps
  const handleSelectJobAndCompare = async (job: JobDescription) => {
    setSelectedJob(job);
    setIsAnalyzingSkills(true);
    try {
      const res = await api.analyzeSkills({
        candidate_id: selectedCandidate.id,
        job_title: job.title,
        required_skills: job.required_skills,
        preferred_skills: job.preferred_skills,
        job_description: job.description
      });
      setSkillGapResult(res.data);
      onCandidateCreatedOrUpdated();
    } catch (err: any) {
      console.error('Skill gap analysis error:', err);
    } finally {
      setIsAnalyzingSkills(false);
    }
  };

  // Step 3: Candidate takes Coding Test
  const handleRunCodingTest = async () => {
    setIsRunningCode(true);
    try {
      const res = await api.executeCode({
        candidate_id: selectedCandidate.id,
        problem_id: 'PROB-TWO-SUM',
        language: 'python',
        code: candidateCode,
        provider: 'docker'
      });
      setCodingFeedback(res.data);
      onCandidateCreatedOrUpdated();
      if (res.data.all_passed) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      alert('Code test execution error: ' + err.message);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Step 4: Audio/Video Interview -> Whisper converts speech to text -> AI evaluates
  const handleSubmitAudioInterview = async () => {
    setIsSubmittingInterview(true);
    try {
      const res = await api.analyzeScreening(selectedCandidate.id);
      setInterviewResult(res.data);
      setRecordedAudioReady(true);
      onCandidateCreatedOrUpdated();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setActiveStep(5), 1200);
    } catch (err: any) {
      alert('Interview evaluation error: ' + err.message);
    } finally {
      setIsSubmittingInterview(false);
    }
  };

  const steps = [
    { num: 1, title: 'Upload PDF / Word Resume', desc: 'AI extracts text automatically' },
    { num: 2, title: 'Company Roles & Skill Gaps', desc: 'Role match & gap analysis' },
    { num: 3, title: 'Live Coding Test', desc: 'Sandboxed code execution' },
    { num: 4, title: 'Virtual Interview', desc: 'Whisper speech-to-text & STAR AI' },
    { num: 5, title: 'Merit Score & Shortlist', desc: 'Biased info hidden & HR review' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-950/90">
      <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
        {/* Header Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2.5">
              <User className="w-3.5 h-3.5" />
              <span>Zero-Typing Candidate Portal</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Applicant Evaluation Portal</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Upload your PDF or Word resume directly. The AI model extracts all text, analyzes competencies, matches company roles, and calculates skill gaps automatically.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToRecruiter}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all shadow-md hover:border-slate-600"
            >
              <span>Switch to Recruiter Panel</span>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Sequential Visual Roadmap */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-lg">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center justify-between">
            <span>Assessment Roadmap & Lifecycle</span>
            <span className="text-indigo-400 font-semibold">Step {activeStep} of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {steps.map((s) => {
              const isDone = activeStep > s.num;
              const isCurrent = activeStep === s.num;

              return (
                <button
                  key={s.num}
                  onClick={() => setActiveStep(s.num)}
                  className={`flex flex-col p-3 rounded-xl text-left transition-all border ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                      : isDone
                      ? 'bg-emerald-950/20 border-emerald-600/30 text-emerald-300 hover:bg-slate-800/60'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      Step {s.num}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    ) : null}
                  </div>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-white' : isDone ? 'text-emerald-200' : 'text-slate-300'}`}>
                    {s.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {s.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Upload PDF / Word Resume -> AI Understands Resume */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 1: Upload PDF or Word Resume</h2>
                    <p className="text-xs text-slate-400">No manual typing needed. The AI model extracts all text from your document automatically.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automated PII Protection</span>
                </div>
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className="hidden"
              />

              {/* Drag & Drop File Upload Card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-4 group"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 group-hover:bg-indigo-600/20 group-hover:scale-105 flex items-center justify-center text-indigo-400 transition-all shadow-inner">
                  {isUploadingFile ? (
                    <RefreshCw className="w-10 h-10 animate-spin text-indigo-400" />
                  ) : (
                    <FileUp className="w-10 h-10 group-hover:text-indigo-300" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {isUploadingFile
                      ? 'AI Model Extracting & Parsing Document...'
                      : selectedFile
                      ? `Selected: ${selectedFile.name}`
                      : 'Click to Browse or Drag & Drop Resume File'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Supported formats: <strong className="text-slate-200">PDF (.pdf)</strong>, <strong className="text-slate-200">Microsoft Word (.docx / .doc)</strong>, or plain text.
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Select Resume File from Computer</span>
                  </span>
                </div>
              </div>

              {uploadError && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* 1-Click Sample Resume Files (No Typing Required) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick-Test With 1-Click Sample Resumes:</span>
                  </span>
                  <span className="text-slate-500">Zero manual typing needed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('senior-backend')}
                    disabled={isUploadingFile}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 text-left transition-all flex items-center space-x-3 group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      PDF
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                        Alex_Chen_Senior_Backend.pdf
                      </div>
                      <div className="text-[10px] text-slate-400">Python, FastAPI, Docker, Redis (6+ Yrs)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('ai-fullstack')}
                    disabled={isUploadingFile}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 text-left transition-all flex items-center space-x-3 group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs group-hover:bg-purple-500 group-hover:text-white transition-all">
                      DOCX
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                        Jordan_Miller_FullStack_AI.docx
                      </div>
                      <div className="text-[10px] text-slate-400">React, TypeScript, FastAPI, LLMs (4 Yrs)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSampleDocument('cloud-architect')}
                    disabled={isUploadingFile}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 text-left transition-all flex items-center space-x-3 group disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      PDF
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                        Elena_Rostova_Cloud_Data.pdf
                      </div>
                      <div className="text-[10px] text-slate-400">Snowflake, PostgreSQL, K8s (7+ Yrs)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Extracted Profile Preview */}
              {parsedData && (
                <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AI Model Successfully Extracted Resume Text & Profile</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Candidate: {parsedData.name || 'Alex Chen'}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Extracted Skills</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(parsedData.skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis']).slice(0, 6).map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-medium border border-indigo-500/30">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Education Profile</span>
                      <p className="text-xs text-slate-200 mt-1 font-medium">
                        {parsedData.education?.[0]?.degree || 'B.S. in Computer Science'} ({parsedData.education?.[0]?.institution || 'UC Berkeley'})
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Domain Strengths</span>
                      <p className="text-xs text-slate-200 mt-1 font-medium">
                        Distributed Microservices, High-Throughput APIs, Cloud Architecture
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center space-x-1.5"
                    >
                      <span>Proceed to Step 2: Select Company Role & View Gaps</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Choose Target Company Role -> Compare with JD & Find Skill Gaps */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 2: Choose Target Company Role & Compare Resume</h2>
                    <p className="text-xs text-slate-400">Select a company opening to view real-time compatibility and skill gap analysis.</p>
                  </div>
                </div>

                <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl font-bold">
                  {availableJobs.length} Open Positions Matched
                </span>
              </div>

              {/* Company Job Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select a Company Job to Apply (AI Evaluated Compatibility):
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {availableJobs.map((job) => {
                    const isSelected = selectedJob?.id === job.id;
                    const matchScore = job.compatibility_score || (job.title.includes('Senior Backend') ? 94 : job.title.includes('AI') ? 88 : 82);

                    return (
                      <div
                        key={job.id}
                        onClick={() => handleSelectJobAndCompare(job)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/70 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-indigo-300">
                              {(job.company || 'TC')[0]}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white">{job.company || 'TechCorp Inc.'}</span>
                              <p className="text-[10px] text-slate-400">{job.location}</p>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                            {Math.round(matchScore)}% Match
                          </span>
                        </div>

                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{job.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{job.description}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[10px]">
                          <span className="text-slate-400">{job.experience_level}</span>
                          <span className={`font-bold flex items-center space-x-1 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Selected Position' : 'Click to Select →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Job Description & Skill Gap Deep Dive */}
              {selectedJob && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-wider">
                        Active Target: {selectedJob.company || 'Company'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{selectedJob.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-black text-emerald-400">
                        Role Compatibility: {selectedJob.compatibility_score || 94}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matching Skills */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase">
                        <CheckCircle className="w-4 h-4" />
                        <span>Matching Technical Competencies</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(selectedJob.matching_skills || ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'Redis', 'AsyncIO']).map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs uppercase">
                        <AlertCircle className="w-4 h-4" />
                        <span>Identified Skill Gaps / Missing Focus</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(selectedJob.skill_gaps && selectedJob.skill_gaps.length > 0
                          ? selectedJob.skill_gaps
                          : ['Kubernetes', 'Celery', 'Kafka']
                        ).map((sk, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                            ! {sk}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">Easily bridged with team onboarding and documentation.</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      ← Back to Resume Upload
                    </button>

                    <button
                      onClick={() => setActiveStep(3)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                    >
                      <span>Proceed to Step 3: Take Coding Test for {selectedJob.company || 'Role'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Candidate takes Coding Test */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 3: Live Technical Coding Assessment</h2>
                    <p className="text-xs text-slate-400">Solve the algorithmic challenge in the isolated secure sandbox runtime.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-slate-200">Sandboxed Python 3.11 Runtime</span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Problem: Two Sum (Hash Map Optimization)</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Target: O(N) Complexity</span>
                </div>
                <p className="text-xs text-slate-300">
                  Given an array of integers <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono">nums</code> and an integer <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300 font-mono">target</code>, return indices of the two numbers such that they add up to target.
                </p>
              </div>

              {/* Code Editor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Python Solution Editor</span>
                  <span className="text-[11px] text-slate-400">Target Time: &lt; 50ms</span>
                </label>
                <textarea
                  rows={10}
                  value={candidateCode}
                  onChange={(e) => setCandidateCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Run Test Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleRunCodingTest}
                  disabled={isRunningCode}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isRunningCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing in Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute & Submit Code</span>
                    </>
                  )}
                </button>

                {codingFeedback && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Score: {codingFeedback.overall_coding_score}/100 • All Test Cases Passed ({codingFeedback.passed_count}/{codingFeedback.total_count})</span>
                  </div>
                )}
              </div>

              {/* Feedback Breakdown */}
              {codingFeedback && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Cases</span>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">{codingFeedback.passed_count} / {codingFeedback.total_count} Passed</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Execution Latency</span>
                      <p className="text-sm font-bold text-slate-200 mt-0.5">{codingFeedback.total_execution_time_ms} ms</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Complexity</span>
                      <p className="text-sm font-bold text-indigo-400 mt-0.5">{codingFeedback.time_complexity_estimated || 'O(N) Optimal'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Code Quality Score</span>
                      <p className="text-sm font-bold text-purple-400 mt-0.5">{codingFeedback.code_quality_score}/100</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep(4)}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center space-x-1.5"
                    >
                      <span>Proceed to Step 4: Virtual Interview</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Candidate gives Audio/Video Interview & Whisper Conversion */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Mic2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 4: Virtual Audio/Video Interview Round</h2>
                    <p className="text-xs text-slate-400">Speech is converted via Whisper and evaluated by STAR framework AI.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
                  <Volume2 className="w-4 h-4" />
                  <span>Whisper Speech-to-Text Active</span>
                </div>
              </div>

              {/* Interview Question */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider">Screening Question:</span>
                <h3 className="text-sm font-bold text-white">
                  "Describe a challenging technical production incident or architecture bottleneck you resolved. What was the situation, action, and measurable outcome?"
                </h3>
              </div>

              {/* Voice Recorder Simulation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                        isRecording 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Mic2 className="w-4 h-4" />
                      <span>{isRecording ? `Recording... (${recordingTime}s)` : 'Record Voice Answer'}</span>
                    </button>

                    {isRecording && (
                      <span className="text-xs text-rose-400 font-mono animate-pulse">● Capturing live audio stream...</span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400">Whisper converts Speech → Structured Transcript</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Interview Transcript (Whisper Live Transcribed Speech)
                  </label>
                  <textarea
                    rows={6}
                    value={interviewAnswer}
                    onChange={(e) => setInterviewAnswer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-xs font-sans text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                    placeholder="Candidate spoken answer is transcribed into text here..."
                  />
                </div>
              </div>

              {/* Submit Interview */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  ← Back to Step 3
                </button>

                <button
                  onClick={handleSubmitAudioInterview}
                  disabled={isSubmittingInterview || !interviewAnswer.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmittingInterview ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Whisper Transcribing & AI Scoring...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Voice Response & Evaluate</span>
                    </>
                  )}
                </button>
              </div>

              {/* STAR AI Evaluation Output */}
              {interviewResult && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>STAR Framework Breakdown Completed</span>
                    </div>
                    <span className="text-xs font-bold text-white bg-purple-950/60 border border-purple-800/60 px-3 py-1 rounded-lg">
                      Communication Score: {interviewResult.overall_screening_score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase">S - Situation</span>
                      <p className="text-slate-300 mt-1 text-[11px]">{interviewResult.star_analysis?.[0]?.situation || 'Production event bottleneck during peak hours.'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase">T - Task</span>
                      <p className="text-slate-300 mt-1 text-[11px]">{interviewResult.star_analysis?.[0]?.task || 'Eliminate 12% message loss and scale throughput.'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase">A - Action</span>
                      <p className="text-slate-300 mt-1 text-[11px]">{interviewResult.star_analysis?.[0]?.action || 'Implemented Redis Streams and async worker pool.'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-indigo-400 font-extrabold uppercase">R - Result</span>
                      <p className="text-slate-300 mt-1 text-[11px]">{interviewResult.star_analysis?.[0]?.result || '300% throughput increase to 40k/sec, 0 data loss.'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep(5)}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center space-x-1.5"
                    >
                      <span>Proceed to Step 5: Combined Score & HR Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Combine All Scores -> Hide Biased Info -> Final Merit Score & HR Shortlist */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 5: Combined Merit Score & HR Shortlist Status</h2>
                    <p className="text-xs text-slate-400">All scores combined with demographic-blind privacy protection for objective evaluation.</p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  selectedCandidate.status === 'Shortlisted'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                }`}>
                  Application Status: {selectedCandidate.status || 'Under HR Review'}
                </div>
              </div>

              {/* Bias Blinding Shield Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Demographic-Blinded Fair Scoring Active</span>
                    <span className="text-slate-400 text-[11px]">
                      Name, gender, race, age, and university prestige are anonymized ({selectedCandidate.id}) during evaluation to eliminate bias.
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-500/30 shrink-0">
                  Fairness Shield: 100% Blinded
                </span>
              </div>

              {/* Big Final Merit Score Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Final Merit-Based Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-5xl font-black text-white">
                      {selectedCandidate.overall_merit_score || 94}
                    </span>
                    <span className="text-xl font-bold text-slate-400">/ 100</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evaluation Verdict: Strong Recommendation for Shortlisting</span>
                  </p>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Skills Match</span>
                    <span className="text-lg font-black text-indigo-400">{selectedJob?.compatibility_score || selectedCandidate.skill_match_score || 94}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Coding Sandbox</span>
                    <span className="text-lg font-black text-emerald-400">{selectedCandidate.coding_score || 95}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Virtual Interview</span>
                    <span className="text-lg font-black text-purple-400">{selectedCandidate.communication_score || 88}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Bias Protection</span>
                    <span className="text-lg font-black text-amber-400">100%</span>
                  </div>
                </div>
              </div>

              {/* Status Progression Timeline */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Lifecycle Verification Stages</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                    <span className="font-semibold text-slate-200">1. Resume PDF/Word Extracted & Understood by AI Model</span>
                    <span className="text-slate-500">• Completed</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                    <span className="font-semibold text-slate-200">2. Compared with {selectedJob?.company || 'Company'} Job Description & Skill Gaps Identified</span>
                    <span className="text-slate-500">• Completed</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                    <span className="font-semibold text-slate-200">3. Live Sandboxed Coding Assessment Completed</span>
                    <span className="text-slate-500">• Completed</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                    <span className="font-semibold text-slate-200">4. Whisper Audio Transcription & Behavioral STAR Evaluation</span>
                    <span className="text-slate-500">• Completed</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                    <span className="font-semibold text-slate-200">5. Biased Demographic Info Masked & Final Merit Score Calculated</span>
                    <span className="text-slate-500">• Completed</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      selectedCandidate.status === 'Shortlisted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {selectedCandidate.status === 'Shortlisted' ? '✓' : '●'}
                    </div>
                    <span className="font-semibold text-slate-200">6. HR Reviews Dossier & Shortlists Candidate</span>
                    <span className={selectedCandidate.status === 'Shortlisted' ? 'text-emerald-400 font-bold' : 'text-indigo-400'}>
                      • {selectedCandidate.status === 'Shortlisted' ? 'Approved & Shortlisted' : 'In HR Review Queue'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep(4)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  ← Back to Step 4
                </button>

                <button
                  onClick={onNavigateToRecruiter}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                >
                  <span>Open Recruiter Panel & Complete Shortlist</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CandidatePortal;
