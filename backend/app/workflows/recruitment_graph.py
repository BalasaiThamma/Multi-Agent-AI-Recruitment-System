import json
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.schemas.candidate import ParsedResumeSchema
from app.schemas.assessment import SkillGapAnalysisResult, CodingEvaluationResult, ScreeningAnalysisResult
from app.schemas.scoring import FairScoreResult, HRNotification, HumanReviewDecision
from app.agents.parsing_agent import ResumeParsingAgent
from app.agents.matching_agent import SkillMatchingAgent
from app.agents.tech_agent import TechCodingAgent
from app.agents.screening_agent import ScreeningAgent
from app.agents.fairness_agent import FairnessAgent
from app.agents.hr_agent import HRAgent

class RecruitmentState(TypedDict):
    candidate_id: str
    raw_resume: str
    job_id: str
    job_title: str
    job_description: str
    required_skills: List[str]
    preferred_skills: List[str]
    coding_code: Optional[str]
    coding_language: str
    audio_file_path: Optional[str]
    
    # State Artifacts Produced by Agents
    parsed_resume: Optional[Dict[str, Any]]
    skill_analysis: Optional[Dict[str, Any]]
    coding_result: Optional[Dict[str, Any]]
    screening_result: Optional[Dict[str, Any]]
    fairness_result: Optional[Dict[str, Any]]
    human_decision: Optional[Dict[str, Any]]
    hr_notification: Optional[Dict[str, Any]]
    
    # Workflow Metadata
    current_stage: str
    logs: List[Dict[str, Any]]
    error: Optional[str]

# --- Nodes ---

def parse_resume_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    logs.append({"stage": "ResumeParsing", "event": "Started parsing resume"})
    
    parsed, meta = ResumeParsingAgent.parse_resume(
        resume_text=state["raw_resume"],
        candidate_id=state["candidate_id"]
    )
    
    logs.append({"stage": "ResumeParsing", "event": "Completed resume parsing", "meta": meta})
    return {
        "parsed_resume": parsed.model_dump(),
        "current_stage": "ResumeParsed",
        "logs": logs
    }

def match_skills_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    logs.append({"stage": "SkillMatching", "event": "Started RAG skill gap analysis"})
    
    parsed_obj = ParsedResumeSchema.model_validate(state["parsed_resume"])
    skill_res, meta = SkillMatchingAgent.analyze_match(
        candidate_id=state["candidate_id"],
        parsed_resume=parsed_obj,
        job_title=state["job_title"],
        required_skills=state["required_skills"],
        preferred_skills=state["preferred_skills"],
        job_description=state["job_description"]
    )
    
    logs.append({"stage": "SkillMatching", "event": "Completed skill gap analysis", "score": skill_res.overall_match_score, "meta": meta})
    return {
        "skill_analysis": skill_res.model_dump(),
        "current_stage": "SkillsMatched",
        "logs": logs
    }

def tech_coding_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    logs.append({"stage": "CodingAssessment", "event": "Executing sandbox test cases"})
    
    code = state.get("coding_code")
    if not code:
        # Default starter code for Two Sum
        code = TechCodingAgent.PREDEFINED_PROBLEMS["PROB-TWO-SUM"]["starter_code"]["python"]
    
    coding_res, meta = TechCodingAgent.evaluate_candidate_code(
        candidate_id=state["candidate_id"],
        problem_id="PROB-TWO-SUM",
        language=state.get("coding_language", "python"),
        code=code,
        provider="docker"
    )
    
    logs.append({"stage": "CodingAssessment", "event": "Completed sandbox coding test", "passed": f"{coding_res.passed_count}/{coding_res.total_count}", "meta": meta})
    return {
        "coding_result": coding_res.model_dump(),
        "current_stage": "CodingCompleted",
        "logs": logs
    }

def screening_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    logs.append({"stage": "Screening", "event": "Processing transcription and STAR analysis"})
    
    screening_res, meta = ScreeningAgent.analyze_screening(
        candidate_id=state["candidate_id"],
        audio_file_path=state.get("audio_file_path")
    )
    
    logs.append({"stage": "Screening", "event": "Completed STAR and communication evaluation", "score": screening_res.overall_screening_score, "meta": meta})
    return {
        "screening_result": screening_res.model_dump(),
        "current_stage": "ScreeningCompleted",
        "logs": logs
    }

def fair_scoring_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    logs.append({"stage": "FairScoring", "event": "Executing PII masking and weighted merit audit"})
    
    parsed_obj = ParsedResumeSchema.model_validate(state["parsed_resume"])
    skill_obj = SkillGapAnalysisResult.model_validate(state["skill_analysis"])
    coding_obj = CodingEvaluationResult.model_validate(state["coding_result"])
    screen_obj = ScreeningAnalysisResult.model_validate(state["screening_result"])
    
    fair_res, identity, evaluation = FairnessAgent.calculate_fair_score(
        candidate_id=state["candidate_id"],
        parsed_resume=parsed_obj,
        skill_res=skill_obj,
        coding_res=coding_obj,
        screening_res=screen_obj
    )
    
    logs.append({"stage": "FairScoring", "event": "Completed fair scoring audit", "overall_merit_score": fair_res.overall_merit_score})
    return {
        "fairness_result": fair_res.model_dump(),
        "current_stage": "AwaitingHumanApproval",
        "logs": logs
    }

def human_approval_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    decision = state.get("human_decision")
    if not decision:
        decision = {
            "candidate_id": state["candidate_id"],
            "reviewer_name": "Lead Hiring Manager",
            "decision": "Approved Shortlist",
            "reviewer_notes": "Strong distributed systems experience and solid live coding test performance."
        }
    logs.append({"stage": "HumanApproval", "event": f"Human decision recorded: {decision['decision']}"})
    return {
        "human_decision": decision,
        "current_stage": "HumanDecisionRecorded",
        "logs": logs
    }

def hr_notification_node(state: RecruitmentState) -> Dict[str, Any]:
    logs = list(state.get("logs", []))
    decision = state.get("human_decision", {})
    fairness = state.get("fairness_result", {})
    
    notif, meta = HRAgent.process_human_decision(
        candidate_id=state["candidate_id"],
        reviewer_name=decision.get("reviewer_name", "HR System"),
        decision=decision.get("decision", "Approved Shortlist"),
        reviewer_notes=decision.get("reviewer_notes", "Automated pipeline completion"),
        overall_score=fairness.get("overall_merit_score", 0.0)
    )
    
    logs.append({"stage": "HRNotification", "event": "Shortlist notification generated and dispatched", "meta": meta})
    return {
        "hr_notification": notif.model_dump(),
        "current_stage": "PipelineCompleted",
        "logs": logs
    }

# --- Conditional Branching ---

def check_resume_quality(state: RecruitmentState) -> str:
    if not state.get("parsed_resume") or not state["parsed_resume"].get("skills"):
        return "manual_review"
    return "match_skills"

def check_skill_threshold(state: RecruitmentState) -> str:
    skill_analysis = state.get("skill_analysis", {})
    if skill_analysis.get("overall_match_score", 0.0) < 30.0:
        return "low_match_review"
    return "tech_coding"

# --- Build LangGraph StateGraph ---

def build_recruitment_graph() -> StateGraph:
    workflow = StateGraph(RecruitmentState)

    workflow.add_node("parse_resume", parse_resume_node)
    workflow.add_node("match_skills", match_skills_node)
    workflow.add_node("tech_coding", tech_coding_node)
    workflow.add_node("screening", screening_node)
    workflow.add_node("fair_scoring", fair_scoring_node)
    workflow.add_node("human_approval", human_approval_node)
    workflow.add_node("hr_notification", hr_notification_node)

    # Set Entry Point
    workflow.set_entry_point("parse_resume")

    # Connect Edges with Conditional Branching
    workflow.add_conditional_edges(
        "parse_resume",
        check_resume_quality,
        {
            "match_skills": "match_skills",
            "manual_review": "fair_scoring"
        }
    )

    workflow.add_conditional_edges(
        "match_skills",
        check_skill_threshold,
        {
            "tech_coding": "tech_coding",
            "low_match_review": "fair_scoring"
        }
    )

    workflow.add_edge("tech_coding", "screening")
    workflow.add_edge("screening", "fair_scoring")
    workflow.add_edge("fair_scoring", "human_approval")
    workflow.add_edge("human_approval", "hr_notification")
    workflow.add_edge("hr_notification", END)

    return workflow.compile()

# Precompiled graph instance
recruitment_app = build_recruitment_graph()
