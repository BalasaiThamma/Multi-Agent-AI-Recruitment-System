import { Candidate, JobDescription, ParsedResume, SkillGapAnalysisResult, CodingEvaluationResult, ScreeningAnalysisResult, FairScoreResult, HRNotification, AgentLog } from '../types';

const API_BASE = '/api';

export const api = {
  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    const res = await fetch(`${API_BASE}/candidates/`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  async getCandidate(id: string): Promise<Candidate> {
    const res = await fetch(`${API_BASE}/candidates/${id}`);
    if (!res.ok) throw new Error('Failed to fetch candidate');
    return res.json();
  },

  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/candidates/reset-demo-data`, { method: 'POST' });
    return res.json();
  },

  async getJobs(): Promise<JobDescription[]> {
    const res = await fetch(`${API_BASE}/candidates/jobs/all`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async uploadResumeFile(file: File, candidateId?: string): Promise<{
    filename: string;
    candidate_id: string;
    candidate: Candidate;
    parsed_resume: ParsedResume;
    matched_jobs: JobDescription[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (candidateId) {
      formData.append('candidate_id', candidateId);
    }
    const res = await fetch(`${API_BASE}/candidates/portal/upload-resume-file`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Resume file upload and parsing failed');
    }
    return res.json();
  },

  // Resume Parsing Agent (Tab 2)
  async parseResume(candidateId: string, resumeText: string, provider: string = 'gemini'): Promise<{ status: string; data: ParsedResume; metadata: any }> {
    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    formData.append('resume_text', resumeText);
    formData.append('provider', provider);
    const res = await fetch(`${API_BASE}/resume/parse`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Resume parsing failed');
    return res.json();
  },

  async validateJson(data: any): Promise<{ valid: boolean; message: string; data?: any; errors?: string }> {
    const res = await fetch(`${API_BASE}/resume/validate-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Skill Matching Agent (Tab 3)
  async analyzeSkills(params: {
    candidate_id: string;
    job_title: string;
    required_skills: string[];
    preferred_skills: string[];
    job_description?: string;
    provider?: string;
  }): Promise<{ status: string; data: SkillGapAnalysisResult; metadata: any }> {
    const res = await fetch(`${API_BASE}/matching/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Skill analysis failed');
    return res.json();
  },

  // Coding Assessment Agent (Tab 4)
  async getCodingProblems(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/coding/problems`);
    return res.json();
  },

  async getCandidateCodingSubmission(candidateId: string): Promise<{
    candidate_id: string;
    problem_id: string;
    language: string;
    submitted_code: string;
    evaluation: CodingEvaluationResult | null;
    has_submitted: boolean;
    score: number;
    status: string;
  }> {
    const res = await fetch(`${API_BASE}/coding/candidate-submission/${candidateId}`);
    if (!res.ok) throw new Error('Failed to fetch candidate coding submission');
    return res.json();
  },

  async uploadResumeDirect(candidateId: string, file: File, provider: string = 'gemini'): Promise<{
    status: string;
    filename: string;
    raw_text: string;
    data: ParsedResume;
    metadata: any;
  }> {
    const formData = new FormData();
    formData.append('candidate_id', candidateId);
    formData.append('file', file);
    formData.append('provider', provider);
    const res = await fetch(`${API_BASE}/resume/upload-file`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Resume document upload and parsing failed');
    }
    return res.json();
  },

  async executeCode(params: {
    candidate_id: string;
    problem_id: string;
    language: string;
    code: string;
    provider: string;
  }): Promise<{ status: string; data: CodingEvaluationResult; metadata: any }> {
    const res = await fetch(`${API_BASE}/coding/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Code execution failed');
    return res.json();
  },

  // Audio Screening Agent (Tab 5)
  async analyzeScreening(candidateId: string, provider: string = 'gemini'): Promise<{ status: string; data: ScreeningAnalysisResult; metadata: any }> {
    const res = await fetch(`${API_BASE}/screening/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, provider }),
    });
    if (!res.ok) throw new Error('Screening analysis failed');
    return res.json();
  },

  async uploadScreeningAudio(file: File, candidateId: string, provider: string = 'gemini'): Promise<{ status: string; data: ScreeningAnalysisResult; metadata: any }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);
    formData.append('provider', provider);
    const res = await fetch(`${API_BASE}/screening/upload-audio`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Audio screening upload and transcription failed');
    return res.json();
  },

  // Fair Scoring Agent (Tab 6)
  async calculateFairScore(candidateId: string): Promise<{ status: string; data: FairScoreResult; identity_vault: any; masked_evaluation: any }> {
    const res = await fetch(`${API_BASE}/scoring/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId }),
    });
    if (!res.ok) throw new Error('Fair scoring evaluation failed');
    return res.json();
  },

  // HR Decisions & Shortlisting (Tab 8)
  async submitDecision(params: {
    candidate_id: string;
    reviewer_name: string;
    decision: string;
    reviewer_notes: string;
  }): Promise<{ status: string; notification: HRNotification }> {
    const res = await fetch(`${API_BASE}/hr/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Decision submission failed');
    return res.json();
  },

  async getNotifications(): Promise<HRNotification[]> {
    const res = await fetch(`${API_BASE}/hr/notifications`);
    return res.json();
  },

  // Workflow Trigger (LangGraph)
  async runFullAssessment(candidateId: string, provider: string = 'gemini'): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/workflow/run-full-assessment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, provider }),
    });
    return res.json();
  },

  // Observability
  async getAgentLogs(): Promise<AgentLog[]> {
    const res = await fetch(`${API_BASE}/observability/logs`);
    return res.json();
  }
};
