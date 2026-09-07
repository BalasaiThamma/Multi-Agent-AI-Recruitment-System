import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, JobDescriptionModel, AssessmentRecordModel
from app.agents.matching_agent import SkillMatchingAgent
from app.schemas.candidate import ParsedResumeSchema

router = APIRouter(prefix="/matching", tags=["Skill Matching"])

@router.post("/analyze")
def analyze_skill_match(
    candidate_id: str = Body(...),
    job_id: Optional[str] = Body(None),
    job_title: str = Body("Senior Backend Engineer"),
    job_description: str = Body(""),
    required_skills: List[str] = Body(["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis"]),
    preferred_skills: List[str] = Body(["Kubernetes", "Celery", "AWS"]),
    provider: str = Body("gemini"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Load parsed resume
    if not c.parsed_data_json:
        raise HTTPException(status_code=400, detail="Candidate resume must be parsed first")
    
    parsed_data = json.loads(c.parsed_data_json)
    parsed_obj = ParsedResumeSchema.model_validate(parsed_data)

    result_obj, meta = SkillMatchingAgent.analyze_match(
        candidate_id=candidate_id,
        parsed_resume=parsed_obj,
        job_title=job_title,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        job_description=job_description,
        provider=provider
    )

    c.skill_match_score = result_obj.overall_match_score
    c.matching_status = "Completed"

    # Save assessment record
    rec = AssessmentRecordModel(
        id=f"ASSESS-MATCH-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="SkillMatching",
        status="Completed",
        score=result_obj.overall_match_score,
        details_json=json.dumps(result_obj.model_dump()),
        execution_time_ms=meta.get("latency_ms", 150.0),
        model_used=meta.get("model", "gemini-3.6-flash")
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": result_obj.model_dump(),
        "metadata": meta
    }
