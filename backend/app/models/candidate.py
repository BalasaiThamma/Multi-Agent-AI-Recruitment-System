import json
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    role_applied = Column(String, default="Senior Backend Engineer")
    status = Column(String, default="Registered")  # Registered, Parsed, Matched, Assessed, Screened, Scored, Shortlisted, Rejected
    
    # Store raw resume text and full parsed JSON
    raw_resume = Column(Text, nullable=True)
    parsed_data_json = Column(Text, nullable=True)
    
    # Workflow Stage Statuses
    resume_status = Column(String, default="Pending")    # Pending, Running, Completed, Failed
    matching_status = Column(String, default="Pending")
    coding_status = Column(String, default="Pending")
    screening_status = Column(String, default="Pending")
    fairness_status = Column(String, default="Pending")
    approval_status = Column(String, default="Pending")  # Pending, Approved, Rejected, Review_Requested
    
    # Aggregate Scores
    skill_match_score = Column(Float, default=0.0)
    coding_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    protocol_score = Column(Float, default=0.0)
    overall_merit_score = Column(Float, default=0.0)
    
    # Relationships
    assessments = relationship("AssessmentRecordModel", back_populates="candidate", cascade="all, delete-orphan")
    reviews = relationship("HumanReviewModel", back_populates="candidate", cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class JobDescriptionModel(Base):
    __tablename__ = "job_descriptions"

    id = Column(String, primary_key=True, index=True)
    company = Column(String, default="TechCorp Inc.")
    title = Column(String, index=True)
    department = Column(String, default="Engineering")
    location = Column(String, default="Remote / Hybrid")
    experience_level = Column(String, default="Senior (5+ years)")
    description = Column(Text)
    required_skills_json = Column(Text)  # JSON array of strings
    preferred_skills_json = Column(Text)  # JSON array of strings
    created_at = Column(DateTime, default=datetime.utcnow)

class AssessmentRecordModel(Base):
    __tablename__ = "assessment_records"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"), index=True)
    stage_name = Column(String, index=True)  # ResumeParsing, SkillMatching, CodingAssessment, Screening, FairScoring
    status = Column(String, default="Completed")
    score = Column(Float, default=0.0)
    details_json = Column(Text)
    execution_time_ms = Column(Float, default=0.0)
    model_used = Column(String, default="gemini-3.6-flash")
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("CandidateModel", back_populates="assessments")

class HumanReviewModel(Base):
    __tablename__ = "human_reviews"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"), index=True)
    reviewer_name = Column(String)
    decision = Column(String)  # Approved Shortlist, Rejected, Request Re-Evaluation
    reviewer_notes = Column(Text)
    ai_score_at_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("CandidateModel", back_populates="reviews")

class AgentLogModel(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, index=True, nullable=True)
    agent_name = Column(String, index=True)
    action = Column(String)
    status = Column(String)  # Started, InProgress, Success, Failed, Fallback
    model = Column(String, default="gemini-3.6-flash")
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    details_json = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class HRNotificationModel(Base):
    __tablename__ = "hr_notifications"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, index=True)
    candidate_masked_ref = Column(String)
    overall_score = Column(Float)
    decision = Column(String)
    message = Column(Text)
    status = Column(String, default="Delivered")
    created_at = Column(DateTime, default=datetime.utcnow)
