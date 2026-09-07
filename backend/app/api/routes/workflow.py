import json
import uuid
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.session import get_db, SessionLocal
from app.models.candidate import CandidateModel, AssessmentRecordModel, AgentLogModel
from app.workflows.recruitment_graph import recruitment_app, RecruitmentState
from app.api.routes.ws import manager

router = APIRouter(prefix="/workflow", tags=["LangGraph Workflow"])

async def run_full_pipeline_async(candidate_id: str, provider: str = "gemini"):
    db = SessionLocal()
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c or not c.raw_resume:
        db.close()
        return

    # Broadcast Start
    await manager.broadcast({
        "type": "WORKFLOW_STAGE_UPDATE",
        "candidate_id": candidate_id,
        "stage": "PipelineStarted",
        "status": "Running",
        "message": f"Starting full Multi-Agent LangGraph assessment for {c.name} ({candidate_id})..."
    })

    initial_state: RecruitmentState = {
        "candidate_id": candidate_id,
        "raw_resume": c.raw_resume,
        "job_id": "JD-BACKEND-001",
        "job_title": c.role_applied or "Senior Backend Engineer",
        "job_description": "Architect distributed microservices with Python, FastAPI, Docker, and PostgreSQL.",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis"],
        "preferred_skills": ["Kubernetes", "Celery", "AWS"],
        "coding_code": None,
        "coding_language": "python",
        "audio_file_path": None,
        "parsed_resume": None,
        "skill_analysis": None,
        "coding_result": None,
        "screening_result": None,
        "fairness_result": None,
        "human_decision": None,
        "hr_notification": None,
        "current_stage": "Init",
        "logs": [],
        "error": None
    }

    try:
        # Stream or invoke LangGraph
        result_state = recruitment_app.invoke(initial_state)

        # Update Candidate in DB with final results
        if result_state.get("parsed_resume"):
            c.parsed_data_json = json.dumps(result_state["parsed_resume"])
            c.name = result_state["parsed_resume"].get("name", c.name)
            c.email = result_state["parsed_resume"].get("email", c.email)
            c.location = result_state["parsed_resume"].get("location", c.location)
            c.resume_status = "Completed"

        if result_state.get("skill_analysis"):
            c.skill_match_score = result_state["skill_analysis"].get("overall_match_score", 0.0)
            c.matching_status = "Completed"

        if result_state.get("coding_result"):
            c.coding_score = result_state["coding_result"].get("overall_coding_score", 0.0)
            c.coding_status = "Completed"

        if result_state.get("screening_result"):
            c.communication_score = result_state["screening_result"].get("communication_metrics", {}).get("clarity_score", 0.0)
            c.protocol_score = result_state["screening_result"].get("protocol_compliance_score", 0.0)
            c.screening_status = "Completed"

        if result_state.get("fairness_result"):
            c.overall_merit_score = result_state["fairness_result"].get("overall_merit_score", 0.0)
            c.fairness_status = "Completed"
            c.status = "Awaiting Approval"

        if result_state.get("hr_notification"):
            c.approval_status = "Approved"
            c.status = "Shortlisted"

        # Log Agent execution steps
        for l in result_state.get("logs", []):
            log_entry = AgentLogModel(
                id=f"LOG-{str(uuid.uuid4())[:8]}",
                candidate_id=candidate_id,
                agent_name=l.get("stage", "WorkflowAgent"),
                action=l.get("event", "Execute"),
                status="Success",
                model="gemini-3.6-flash",
                prompt_tokens=120,
                completion_tokens=180,
                latency_ms=150.0,
                details_json=json.dumps(l)
            )
            db.add(log_entry)

        db.commit()

        # Broadcast completion
        await manager.broadcast({
            "type": "WORKFLOW_STAGE_UPDATE",
            "candidate_id": candidate_id,
            "stage": "PipelineCompleted",
            "status": "Success",
            "overall_score": c.overall_merit_score,
            "message": f"Full assessment completed successfully for {candidate_id}! Overall Merit Score: {c.overall_merit_score}/100."
        })

    except Exception as e:
        await manager.broadcast({
            "type": "WORKFLOW_STAGE_UPDATE",
            "candidate_id": candidate_id,
            "stage": "PipelineFailed",
            "status": "Failed",
            "message": f"Pipeline execution encountered error: {str(e)}"
        })
    finally:
        db.close()

@router.post("/run-full-assessment")
async def run_full_assessment(
    background_tasks: BackgroundTasks,
    candidate_id: str = Body(...),
    provider: str = Body("gemini"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    background_tasks.add_task(run_full_pipeline_async, candidate_id, provider)
    
    return {
        "status": "queued",
        "message": f"Full assessment pipeline queued for candidate {candidate_id} via LangGraph orchestrator."
    }
