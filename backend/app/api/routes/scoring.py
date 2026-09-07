import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, AssessmentRecordModel
from app.agents.fairness_agent import FairnessAgent
from app.schemas.candidate import ParsedResumeSchema
from app.schemas.assessment import SkillGapAnalysisResult, CodingEvaluationResult, ScreeningAnalysisResult
from app.agents.matching_agent import SkillMatchingAgent
from app.agents.tech_agent import TechCodingAgent
from app.agents.screening_agent import ScreeningAgent

router = APIRouter(prefix="/scoring", tags=["Fair Scoring"])

@router.post("/evaluate")
def calculate_fair_score(
    candidate_id: str = Body(...),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Ensure previous steps exist or run defaults
    if not c.parsed_data_json:
        raise HTTPException(status_code=400, detail="Candidate resume must be parsed first")
    
    parsed_obj = ParsedResumeSchema.model_validate(json.loads(c.parsed_data_json))
    
    # Get skill analysis
    skill_res, _ = SkillMatchingAgent.analyze_match(
        candidate_id=candidate_id,
        parsed_resume=parsed_obj,
        job_title=c.role_applied,
        required_skills=["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis"],
        preferred_skills=["Kubernetes", "Celery", "AWS"],
        job_description=""
    )

    # Get coding result
    coding_res, _ = TechCodingAgent.evaluate_candidate_code(
        candidate_id=candidate_id,
        problem_id="PROB-TWO-SUM",
        language="python",
        code=TechCodingAgent.PREDEFINED_PROBLEMS["PROB-TWO-SUM"]["starter_code"]["python"],
        provider="docker"
    )

    # Get screening result
    screening_res, _ = ScreeningAgent.analyze_screening(candidate_id=candidate_id)

    fair_res, identity_data, eval_data = FairnessAgent.calculate_fair_score(
        candidate_id=candidate_id,
        parsed_resume=parsed_obj,
        skill_res=skill_res,
        coding_res=coding_res,
        screening_res=screening_res
    )

    c.skill_match_score = fair_res.skill_match_score
    c.coding_score = fair_res.coding_score
    c.communication_score = fair_res.communication_score
    c.protocol_score = fair_res.protocol_compliance_score
    c.overall_merit_score = fair_res.overall_merit_score
    c.fairness_status = "Completed"

    # Save assessment record
    rec = AssessmentRecordModel(
        id=f"ASSESS-FAIR-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="FairScoring",
        status="Completed",
        score=fair_res.overall_merit_score,
        details_json=json.dumps(fair_res.model_dump()),
        execution_time_ms=85.0,
        model_used="FairnessAudit-v1"
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": fair_res.model_dump(),
        "identity_vault": identity_data.model_dump(),
        "masked_evaluation": eval_data.model_dump()
    }
