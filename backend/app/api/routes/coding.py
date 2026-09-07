import json
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, AssessmentRecordModel
from app.agents.tech_agent import TechCodingAgent

router = APIRouter(prefix="/coding", tags=["Coding Assessment"])

@router.get("/problems")
def get_problems():
    return list(TechCodingAgent.PREDEFINED_PROBLEMS.values())

@router.get("/candidate-submission/{candidate_id}")
def get_candidate_submission(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    rec = db.query(AssessmentRecordModel).filter(
        AssessmentRecordModel.candidate_id == candidate_id,
        AssessmentRecordModel.stage_name == "CodingAssessment"
    ).order_by(AssessmentRecordModel.created_at.desc()).first()

    default_prob = TechCodingAgent.PREDEFINED_PROBLEMS["PROB-TWO-SUM"]
    default_solution = default_prob["starter_code"]["python"]
    
    if rec and rec.details_json:
        try:
            details = json.loads(rec.details_json)
            return {
                "candidate_id": c.id,
                "problem_id": details.get("problem_id", "PROB-TWO-SUM"),
                "language": details.get("language", "python"),
                "submitted_code": details.get("submitted_code") or default_solution,
                "evaluation": details,
                "has_submitted": True,
                "score": c.coding_score,
                "status": c.coding_status
            }
        except Exception:
            pass

    return {
        "candidate_id": c.id,
        "problem_id": "PROB-TWO-SUM",
        "language": "python",
        "submitted_code": default_solution,
        "evaluation": None,
        "has_submitted": c.coding_score > 0,
        "score": c.coding_score,
        "status": c.coding_status
    }

@router.post("/execute")
def execute_coding_test(
    candidate_id: str = Body(...),
    problem_id: str = Body("PROB-TWO-SUM"),
    language: str = Body("python"),
    code: str = Body(...),
    provider: str = Body("docker"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    result_obj, meta = TechCodingAgent.evaluate_candidate_code(
        candidate_id=candidate_id,
        problem_id=problem_id,
        language=language,
        code=code,
        provider=provider
    )

    c.coding_score = result_obj.overall_coding_score
    c.coding_status = "Completed"

    # Save assessment record
    rec = AssessmentRecordModel(
        id=f"ASSESS-CODE-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="CodingAssessment",
        status="Completed",
        score=result_obj.overall_coding_score,
        details_json=json.dumps(result_obj.model_dump()),
        execution_time_ms=result_obj.total_execution_time_ms,
        model_used=f"Sandbox-{provider}"
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": result_obj.model_dump(),
        "metadata": meta
    }
