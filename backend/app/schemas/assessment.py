from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Tab 3: Skill Matching & Gap Analysis ----------------- #

class SkillMatchItem(BaseModel):
    skill_name: str
    category: str = Field(..., description="'Strong Match', 'Partial Match', or 'Skill Gap'")
    candidate_evidence: Optional[str] = Field(None, description="Direct quote or proof from resume")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0 - 1.0")
    importance: str = Field("Required", description="'Required' or 'Preferred'")

class SkillGapAnalysisResult(BaseModel):
    candidate_id: str
    job_id: Optional[str] = None
    job_title: str
    overall_match_score: float = Field(..., ge=0.0, le=100.0, description="Overall match percentage 0-100")
    strong_matches: List[SkillMatchItem] = Field(default_factory=list)
    partial_matches: List[SkillMatchItem] = Field(default_factory=list)
    skill_gaps: List[SkillMatchItem] = Field(default_factory=list)
    experience_gap_notes: Optional[str] = None
    education_match_notes: Optional[str] = None
    recommendations: List[str] = Field(default_factory=list)

# ----------------- Tab 4: Coding Assessment ----------------- #

class TestCaseResult(BaseModel):
    test_id: int
    name: str
    input_data: str
    expected_output: str
    actual_output: Optional[str] = None
    passed: bool
    execution_time_ms: float
    memory_used_mb: float
    error_message: Optional[str] = None

class CodingEvaluationRequest(BaseModel):
    candidate_id: str
    problem_id: str
    language: str  # python, javascript, java, cpp
    code: str
    provider: Optional[str] = "docker"  # docker, e2b, subprocess

class CodingEvaluationResult(BaseModel):
    candidate_id: str
    problem_id: str
    language: str
    sandbox_provider: str
    passed_count: int
    total_count: int
    all_passed: bool
    correctness_score: float = Field(..., ge=0.0, le=100.0)
    total_execution_time_ms: float
    peak_memory_mb: float
    test_case_results: List[TestCaseResult] = Field(default_factory=list)
    edge_cases_handled: Dict[str, bool] = Field(default_factory=dict)
    time_complexity_estimated: str = "O(n)"
    space_complexity_estimated: str = "O(1)"
    cyclomatic_complexity: int = 1
    cyclomatic_complexity_rating: str = "Low"  # Low (1-5), Moderate (6-10), High (>10)
    code_quality_score: float = Field(..., ge=0.0, le=100.0)
    quality_feedback: List[str] = Field(default_factory=list)
    overall_coding_score: float = Field(..., ge=0.0, le=100.0)

# ----------------- Tab 5: Screening & STAR Analysis ----------------- #

class STARComponent(BaseModel):
    situation: str = Field(..., description="Context, background, and initial situation")
    task: str = Field(..., description="Challenge, responsibility, or objective")
    action: str = Field(..., description="Specific technical actions taken by the candidate")
    result: str = Field(..., description="Measurable impact, outcome, or lessons learned")
    star_completeness_score: float = Field(..., ge=0.0, le=100.0)

class ProtocolQuestionCheck(BaseModel):
    question_number: int
    question_text: str
    is_answered: bool
    candidate_answer_summary: Optional[str] = None
    relevance_score: float = Field(..., ge=0.0, le=100.0)

class CommunicationMetrics(BaseModel):
    clarity_score: float = Field(..., ge=0.0, le=100.0)
    structure_score: float = Field(..., ge=0.0, le=100.0)
    conciseness_score: float = Field(..., ge=0.0, le=100.0)
    technical_explanation_depth: float = Field(..., ge=0.0, le=100.0)
    filler_word_count: int = 0
    filler_words_detected: List[str] = Field(default_factory=list)
    speech_pace_wpm: Optional[int] = 135
    long_pauses_count: int = 0

class ScreeningAnalysisResult(BaseModel):
    candidate_id: str
    transcript_full: str
    timestamped_segments: List[Dict[str, Any]] = Field(default_factory=list)
    detected_language: str = "en"
    transcription_confidence: float = 0.96
    star_analysis: List[STARComponent] = Field(default_factory=list)
    communication_metrics: CommunicationMetrics
    protocol_compliance: List[ProtocolQuestionCheck] = Field(default_factory=list)
    protocol_compliance_score: float = Field(..., ge=0.0, le=100.0)
    overall_screening_score: float = Field(..., ge=0.0, le=100.0)
