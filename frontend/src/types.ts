export interface EducationItem {
  degree: string;
  institution: string;
  graduation_year?: number;
  gpa_or_grade?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  tech_stack: string[];
  link?: string;
}

export interface ParsedResume {
  candidate_id?: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary: string;
  education: EducationItem[];
  graduation_year?: number;
  skills: string[];
  programming_languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  role_applied: string;
  status: string;
  resume_status: string;
  matching_status: string;
  coding_status: string;
  screening_status: string;
  fairness_status: string;
  approval_status: string;
  skill_match_score: number;
  coding_score: number;
  communication_score: number;
  protocol_score: number;
  overall_merit_score: number;
  parsed_data?: ParsedResume;
  raw_resume?: string;
}

export interface JobDescription {
  id: string;
  company?: string;
  title: string;
  department: string;
  location: string;
  experience_level: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  compatibility_score?: number;
  matching_skills?: string[];
  skill_gaps?: string[];
  recommendations?: string[];
}

export interface SkillMatchItem {
  skill_name: string;
  category: 'Strong Match' | 'Partial Match' | 'Skill Gap';
  candidate_evidence?: string;
  confidence: number;
  importance: 'Required' | 'Preferred';
}

export interface SkillGapAnalysisResult {
  candidate_id: string;
  job_title: string;
  overall_match_score: number;
  strong_matches: SkillMatchItem[];
  partial_matches: SkillMatchItem[];
  skill_gaps: SkillMatchItem[];
  experience_gap_notes?: string;
  education_match_notes?: string;
  recommendations: string[];
}

export interface TestCaseResult {
  test_id: number;
  name: string;
  input_data: string;
  expected_output: string;
  actual_output?: string;
  passed: boolean;
  execution_time_ms: number;
  memory_used_mb: number;
  error_message?: string;
}

export interface CodingEvaluationResult {
  candidate_id: string;
  problem_id: string;
  language: string;
  sandbox_provider: string;
  passed_count: number;
  total_count: number;
  all_passed: boolean;
  correctness_score: number;
  total_execution_time_ms: number;
  peak_memory_mb: number;
  test_case_results: TestCaseResult[];
  edge_cases_handled: Record<string, boolean>;
  time_complexity_estimated: string;
  space_complexity_estimated: string;
  cyclomatic_complexity: number;
  cyclomatic_complexity_rating: string;
  code_quality_score: number;
  quality_feedback: string[];
  overall_coding_score: number;
}

export interface STARComponent {
  situation: string;
  task: string;
  action: string;
  result: string;
  star_completeness_score: number;
}

export interface CommunicationMetrics {
  clarity_score: number;
  structure_score: number;
  conciseness_score: number;
  technical_explanation_depth: number;
  filler_word_count: number;
  filler_words_detected: string[];
  speech_pace_wpm: number;
  long_pauses_count: number;
}

export interface ProtocolQuestionCheck {
  question_number: number;
  question_text: string;
  is_answered: boolean;
  candidate_answer_summary?: string;
  relevance_score: number;
}

export interface ScreeningAnalysisResult {
  candidate_id: string;
  transcript_full: string;
  timestamped_segments: Array<{ start: number; end: number; text: string }>;
  detected_language: string;
  transcription_confidence: number;
  star_analysis: STARComponent[];
  communication_metrics: CommunicationMetrics;
  protocol_compliance: ProtocolQuestionCheck[];
  protocol_compliance_score: number;
  overall_screening_score: number;
}

export interface FairnessAuditCheck {
  check_name: string;
  status: boolean;
  description: string;
  evidence_trail: string;
}

export interface EvaluationData {
  candidate_id: string;
  role_applied: string;
  skills: string[];
  years_experience_level: string;
  skill_match_score: number;
  coding_score: number;
  communication_score: number;
  protocol_compliance_score: number;
  coding_evidence: string;
  screening_evidence: string;
  skill_evidence: string;
}

export interface FairScoreResult {
  candidate_id: string;
  skill_match_score: number;
  coding_score: number;
  communication_score: number;
  protocol_compliance_score: number;
  overall_merit_score: number;
  ai_recommendation: string;
  fairness_passed: boolean;
  audit_checks: FairnessAuditCheck[];
  masked_evaluation_data: EvaluationData;
  scoring_rationale: string;
}

export interface HRNotification {
  id?: string;
  notification_id?: string;
  candidate_id: string;
  candidate_masked_ref: string;
  overall_score: number;
  decision: string;
  message?: string;
  notification_message?: string;
  status: string;
  created_at?: string;
  timestamp?: string;
}

export interface AgentLog {
  id: string;
  candidate_id?: string;
  agent_name: string;
  action: string;
  status: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  details_json?: string;
  error_message?: string;
  timestamp?: string;
}
