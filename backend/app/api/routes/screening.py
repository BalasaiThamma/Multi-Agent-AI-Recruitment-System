import json
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, AssessmentRecordModel
from app.agents.screening_agent import ScreeningAgent

router = APIRouter(prefix="/screening", tags=["Audio Video Screening"])

@router.post("/analyze")
def analyze_screening_response(
    candidate_id: str = Body(..., embed=True),
    provider: str = Body("gemini"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    result_obj, meta = ScreeningAgent.analyze_screening(
        candidate_id=candidate_id,
        provider=provider
    )

    c.communication_score = result_obj.communication_metrics.clarity_score
    c.protocol_score = result_obj.protocol_compliance_score
    c.screening_status = "Completed"

    rec = AssessmentRecordModel(
        id=f"ASSESS-SCREEN-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="Screening",
        status="Completed",
        score=result_obj.overall_screening_score,
        details_json=json.dumps(result_obj.model_dump()),
        execution_time_ms=meta.get("latency_ms", 210.0),
        model_used=meta.get("model", "gemini-3.6-flash")
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": result_obj.model_dump(),
        "metadata": meta
    }

@router.post("/upload-audio")
async def upload_screening_audio(
    file: UploadFile = File(...),
    candidate_id: str = Form(...),
    provider: str = Form("gemini"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    import tempfile, os
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result_obj, meta = ScreeningAgent.analyze_screening(
            candidate_id=candidate_id,
            audio_file_path=tmp_path,
            provider=provider
        )
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    c.communication_score = result_obj.communication_metrics.clarity_score
    c.protocol_score = result_obj.protocol_compliance_score
    c.screening_status = "Completed"

    rec = AssessmentRecordModel(
        id=f"ASSESS-SCREEN-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="Screening",
        status="Completed",
        score=result_obj.overall_screening_score,
        details_json=json.dumps(result_obj.model_dump()),
        execution_time_ms=meta.get("latency_ms", 240.0),
        model_used=meta.get("model", "gemini-3.6-flash")
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": result_obj.model_dump(),
        "metadata": meta
    }
