from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Tab 6: Fair Scoring & PII Masking ----------------- #

class IdentityData(BaseModel):
    """Demographic & Identifiable information stored strictly separately."""
    candidate_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    graduation_year: Optional[int] = None
    photo_url: Optional[str] = None
    gender: Optional[str] = None

class EvaluationData(BaseModel):
    """Job-relevant only data presented to fair scoring agent."""
    candidate_id: str
    role_applied: str
    skills: List[str] = Field(default_factory=list)
    years_experience_level: str
    skill_match_score: float
    coding_score: float
    communication_score: float
    protocol_compliance_score: float
    coding_evidence: str
    screening_evidence: str
    skill_evidence: str

class FairnessAuditCheck(BaseModel):
    check_name: str
    status: bool  # True = Pass
    description: str
    evidence_trail: str

class FairScoreResult(BaseModel):
    candidate_id: str
    # Weighted Merit Calculation
    skill_match_score: float = Field(..., description="Weight 30%")
    coding_score: float = Field(..., description="Weight 35%")
    communication_score: float = Field(..., description="Weight 20%")
    protocol_compliance_score: float = Field(..., description="Weight 15%")
    
    overall_merit_score: float = Field(..., ge=0.0, le=100.0)
    ai_recommendation: str = Field(..., description="'Recommend for Shortlist', 'Review Recommended', or 'Does Not Meet Bar'")
    
    # Fairness Audit Breakdown
    fairness_passed: bool
    audit_checks: List[FairnessAuditCheck] = Field(default_factory=list)
    masked_evaluation_data: EvaluationData
    scoring_rationale: str

# ----------------- Tab 8: Human Review & HR Decision ----------------- #

class HumanReviewDecision(BaseModel):
    candidate_id: str
    reviewer_name: str
    decision: str = Field(..., description="'Approved Shortlist', 'Rejected', 'Request Re-Evaluation', 'Request Human Interview'")
    reviewer_notes: str
    custom_weight_override: Optional[Dict[str, float]] = None

class HRNotification(BaseModel):
    notification_id: str
    candidate_id: str
    candidate_masked_ref: str
    overall_score: float
    decision: str
    timestamp: str
    notification_message: str
    status: str = "Delivered"
